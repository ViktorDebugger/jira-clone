import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createTaskSchema } from "../schemas";
import { getMember, isWorkspaceAdmin } from "@/features/members/utils";
import { DATABASE_ID, PROJECTS_ID, TASKS_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import z from "zod";
import { Task, TaskStatus } from "../types";
import { createAdminClient } from "@/lib/appwrite";
import { Project } from "@/features/projects/types";
import {
  fetchTagsMapForWorkspace,
  orderedTagsFromIds,
  fetchTagsOrderedForTask,
  validateTaskTagIdsForWorkspace,
} from "./task-tag-helpers";
import {
  fetchEnrichedMembersByIds,
  orderedAssigneesFromMap,
  validateAssigneeIdsForWorkspace,
} from "./task-assignee-helpers";
import {
  validateSprintForProject,
  fetchSprintsMapByIds,
  getSprintForTaskPopulate,
} from "./task-sprint-helpers";

const app = new Hono()
  .delete("/:taskId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { taskId } = c.req.param();

    const task = await databases.getDocument<Task>(
      DATABASE_ID,
      TASKS_ID,
      taskId
    );

    const member = await getMember({
      databases,
      workspaceId: task.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (!isWorkspaceAdmin(member)) {
      return c.json({ error: "Forbidden" }, 403);
    }

    await databases.deleteDocument(DATABASE_ID, TASKS_ID, taskId);

    return c.json({ data: { $id: task.$id } });
  })
  .get(
    "/",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        workspaceId: z.string(),
        projectId: z.string().nullish(),
        assigneeId: z.string().nullish(),
        status: z.nativeEnum(TaskStatus).nullish(),
        search: z.string().nullish(),
        dueDate: z.string().nullish(),
        tagIds: z.string().nullish(),
      })
    ),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");

      const { workspaceId, projectId, status, search, assigneeId, dueDate, tagIds } =
        c.req.valid("query");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const query = [
        Query.equal("workspaceId", workspaceId),
        Query.orderDesc("$createdAt"),
      ];

      if (projectId) {
        query.push(Query.equal("projectId", projectId));
      }

      if (status) {
        query.push(Query.equal("status", status));
      }

      if (assigneeId) {
        query.push(Query.contains("assigneeIds", assigneeId));
      }

      if (dueDate) {
        query.push(Query.equal("dueDate", dueDate));
      }

      if (search) {
        query.push(Query.search("search", search));
      }

      const tagFilterIds = [
        ...new Set(
          (tagIds ?? "")
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean),
        ),
      ];
      if (tagFilterIds.length > 0) {
        query.push(
          Query.or(
            tagFilterIds.map((id) => Query.contains("tagIds", id)),
          ),
        );
      }

      const tasks = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_ID,
        query
      );

      const projectIds = tasks.documents.map((task) => task.projectId);
      const allMemberIdsFromAssignees = [
        ...new Set(
          tasks.documents.flatMap((task) =>
            (task.assigneeIds ?? []).map((id) => id.trim()).filter(Boolean),
          ),
        ),
      ];

      const projects = await databases.listDocuments<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectIds.length > 0 ? [Query.contains("$id", projectIds)] : []
      );

      const { users } = await createAdminClient();
      const memberMap = await fetchEnrichedMembersByIds(
        databases,
        users,
        workspaceId,
        allMemberIdsFromAssignees,
      );

      const allTagIds = [
        ...new Set(
          tasks.documents.flatMap((task) =>
            (task.tagIds ?? []).filter((tid) => tid.trim()),
          ),
        ),
      ];

      const tagMap = await fetchTagsMapForWorkspace(
        databases,
        workspaceId,
        allTagIds,
      );

      const allSprintIds = [
        ...new Set(
          tasks.documents
            .map((task) => task.sprintId?.trim())
            .filter((sid): sid is string => Boolean(sid)),
        ),
      ];
      const sprintMap = await fetchSprintsMapByIds(
        databases,
        workspaceId,
        allSprintIds,
      );

      const populatedTasks = tasks.documents.map((task) => {
        const project = projects.documents.find(
          (project) => project.$id === task.projectId
        );

        const sid = task.sprintId?.trim();
        let sprintResolved = sid ? sprintMap.get(sid) ?? null : null;
        if (
          sprintResolved &&
          sprintResolved.projectId !== task.projectId
        ) {
          sprintResolved = null;
        }

        return {
          ...task,
          project,
          sprint: sprintResolved,
          assignees: orderedAssigneesFromMap(task.assigneeIds, memberMap),
          tags: orderedTagsFromIds(task.tagIds, tagMap),
        };
      });

      return c.json({
        data: {
          ...tasks,
          documents: populatedTasks,
        },
      });
    }
  )
  .post(
    "/",
    sessionMiddleware,
    zValidator("json", createTaskSchema),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const {
        name,
        status,
        workspaceId,
        projectId,
        dueDate,
        assigneeIds,
        description,
        tagIds,
        sprintId,
      } = c.req.valid("json");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (!isWorkspaceAdmin(member)) {
        return c.json({ error: "Forbidden" }, 403);
      }

      const tagsValid = await validateTaskTagIdsForWorkspace(
        databases,
        workspaceId,
        tagIds,
      );
      if (!tagsValid) {
        return c.json({ error: "Invalid tags" }, 400);
      }

      const assigneesValid = await validateAssigneeIdsForWorkspace(
        databases,
        workspaceId,
        assigneeIds,
      );
      if (!assigneesValid) {
        return c.json({ error: "Invalid assignees" }, 400);
      }

      const sprintOk = await validateSprintForProject(
        databases,
        sprintId,
        workspaceId,
        projectId,
      );
      if (!sprintOk) {
        return c.json({ error: "Invalid sprint" }, 400);
      }

      const highestPositionTask = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("status", status),
          Query.equal("workspaceId", workspaceId),
          Query.orderAsc("position"),
          Query.limit(1),
        ]
      );

      const newPosition =
        highestPositionTask.documents.length > 0
          ? highestPositionTask.documents[0].position + 1000
          : 1000;

      const payload: Record<string, unknown> = {
        name,
        status,
        workspaceId,
        projectId,
        dueDate,
        assigneeIds,
        position: newPosition,
        description: description ?? "",
        tagIds,
      };

      if (sprintId !== null && sprintId !== undefined && sprintId.trim()) {
        payload.sprintId = sprintId.trim();
      }

      const task = await databases.createDocument(
        DATABASE_ID,
        TASKS_ID,
        ID.unique(),
        payload,
      );

      const { users } = await createAdminClient();
      const tags = await fetchTagsOrderedForTask(
        databases,
        workspaceId,
        task.tagIds,
      );

      const memberMap = await fetchEnrichedMembersByIds(
        databases,
        users,
        workspaceId,
        task.assigneeIds ?? [],
      );

      const assignees = orderedAssigneesFromMap(task.assigneeIds, memberMap);

      const sprint = await getSprintForTaskPopulate(
        databases,
        task as unknown as Task,
      );

      return c.json({ data: { ...task, tags, assignees, sprint } });
    }
  )
  .patch(
    "/:taskId",
    sessionMiddleware,
    zValidator("json", createTaskSchema.partial()),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const body = c.req.valid("json");

      const { taskId } = c.req.param();

      const existingTask = await databases.getDocument<Task>(
        DATABASE_ID,
        TASKS_ID,
        taskId
      );

      const member = await getMember({
        databases,
        workspaceId: existingTask.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (body.tagIds !== undefined) {
        const tagsValid = await validateTaskTagIdsForWorkspace(
          databases,
          existingTask.workspaceId,
          body.tagIds,
        );
        if (!tagsValid) {
          return c.json({ error: "Invalid tags" }, 400);
        }
      }

      if (body.assigneeIds !== undefined) {
        const assigneesValid = await validateAssigneeIdsForWorkspace(
          databases,
          existingTask.workspaceId,
          body.assigneeIds,
        );
        if (!assigneesValid) {
          return c.json({ error: "Invalid assignees" }, 400);
        }
      }

      const nextProjectId =
        body.projectId !== undefined
          ? body.projectId
          : existingTask.projectId;
      const nextSprintId =
        body.sprintId !== undefined ? body.sprintId : existingTask.sprintId;

      if (body.sprintId !== undefined || body.projectId !== undefined) {
        const sprintOk = await validateSprintForProject(
          databases,
          nextSprintId,
          existingTask.workspaceId,
          nextProjectId,
        );
        if (!sprintOk) {
          return c.json({ error: "Invalid sprint" }, 400);
        }
      }

      const updates: Record<string, unknown> = {};
      if (body.name !== undefined) updates.name = body.name;
      if (body.status !== undefined) updates.status = body.status;
      if (body.description !== undefined) updates.description = body.description;
      if (body.projectId !== undefined) updates.projectId = body.projectId;
      if (body.dueDate !== undefined) updates.dueDate = body.dueDate;
      if (body.assigneeIds !== undefined) updates.assigneeIds = body.assigneeIds;
      if (body.tagIds !== undefined) updates.tagIds = body.tagIds;
      if (body.sprintId !== undefined) updates.sprintId = body.sprintId;

      const task = await databases.updateDocument(
        DATABASE_ID,
        TASKS_ID,
        taskId,
        updates,
      );

      const { users } = await createAdminClient();
      const tags = await fetchTagsOrderedForTask(
        databases,
        existingTask.workspaceId,
        task.tagIds,
      );

      const memberMap = await fetchEnrichedMembersByIds(
        databases,
        users,
        existingTask.workspaceId,
        task.assigneeIds ?? [],
      );

      const assignees = orderedAssigneesFromMap(task.assigneeIds, memberMap);

      const sprint = await getSprintForTaskPopulate(
        databases,
        task as unknown as Task,
      );

      return c.json({ data: { ...task, tags, assignees, sprint } });
    }
  )
  .get("/:taskId", sessionMiddleware, async (c) => {
    const currentUser = c.get("user");
    const databases = c.get("databases");
    const { users } = await createAdminClient();
    const { taskId } = c.req.param();

    const task = await databases.getDocument<Task>(
      DATABASE_ID,
      TASKS_ID,
      taskId
    );

    const currentMember = await getMember({
      databases,
      workspaceId: task.workspaceId,
      userId: currentUser.$id,
    });

    if (!currentMember) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const project = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECTS_ID,
      task.projectId
    );

    const memberMap = await fetchEnrichedMembersByIds(
      databases,
      users,
      task.workspaceId,
      task.assigneeIds ?? [],
    );

    const assignees = orderedAssigneesFromMap(task.assigneeIds, memberMap);

    const tags = await fetchTagsOrderedForTask(
      databases,
      task.workspaceId,
      task.tagIds,
    );

    const sprint = await getSprintForTaskPopulate(databases, task as Task);

    return c.json({
      data: {
        ...task,
        project,
        assignees,
        tags,
        sprint,
      },
    });
  })
  .post(
    "/bulk-update",
    sessionMiddleware,
    zValidator(
      "json",
      z.object({
        tasks: z.array(
          z.object({
            $id: z.string(),
            status: z.nativeEnum(TaskStatus),
            position: z.number().int().positive().min(1000).max(1_000_000),
          })
        ),
      })
    ),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { tasks } = await c.req.valid("json");

      const tasksToUpdate = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.contains(
            "$id",
            tasks.map((task) => task.$id)
          ),
        ]
      );

      const workspaceIds = new Set(
        tasksToUpdate.documents.map((task) => task.workspaceId)
      );
      if (workspaceIds.size !== 1) {
        return c.json({ error: "All tasks must belong to the same workspace" });
      }

      const workspaceId = workspaceIds.values().next().value as string;

      if (!workspaceId) {
        return c.json({ error: "Workspace ID is required" }, 400);
      }

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const updatedTasks = await Promise.all(
        tasks.map(async (task) => {
          const { $id, status, position } = task;
          return databases.updateDocument<Task>(DATABASE_ID, TASKS_ID, $id, {
            status,
            position,
          });
        })
      );

      return c.json({ data: updatedTasks });
    }
  );

export default app;
