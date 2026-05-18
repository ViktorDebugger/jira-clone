import { DATABASE_ID, PROJECTS_ID, SPRINTS_ID, TASKS_ID } from "@/config";
import { getMember, isWorkspaceAdmin } from "@/features/members/utils";
import { Project } from "@/features/projects/types";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import z from "zod";

import { createSprintSchema, updateSprintSchema } from "../schemas";
import type { Sprint } from "../types";

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        workspaceId: z.string(),
        projectId: z.string(),
      }),
    ),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { workspaceId, projectId } = c.req.valid("query");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      let project: Project;
      try {
        project = await databases.getDocument<Project>(
          DATABASE_ID,
          PROJECTS_ID,
          projectId,
        );
      } catch {
        return c.json({ error: "Project not found" }, 404);
      }

      if (project.workspaceId !== workspaceId) {
        return c.json({ error: "Project not found" }, 404);
      }

      const sprints = await databases.listDocuments<Sprint>(
        DATABASE_ID,
        SPRINTS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.equal("projectId", projectId),
          Query.orderDesc("startDate"),
          Query.limit(500),
        ],
      );

      return c.json({ data: sprints });
    },
  )
  .post(
    "/",
    sessionMiddleware,
    zValidator("json", createSprintSchema),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { workspaceId, projectId, name, startDate, endDate } =
        c.req.valid("json");

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

      let project: Project;
      try {
        project = await databases.getDocument<Project>(
          DATABASE_ID,
          PROJECTS_ID,
          projectId,
        );
      } catch {
        return c.json({ error: "Invalid project" }, 400);
      }

      if (project.workspaceId !== workspaceId) {
        return c.json({ error: "Invalid project" }, 400);
      }

      const sprint = await databases.createDocument(
        DATABASE_ID,
        SPRINTS_ID,
        ID.unique(),
        {
          workspaceId,
          projectId,
          name,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      );

      return c.json({ data: sprint });
    },
  )
  .patch(
    "/:sprintId",
    sessionMiddleware,
    zValidator("json", updateSprintSchema),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { sprintId } = c.req.param();
      const body = c.req.valid("json");

      const existing = await databases.getDocument<Sprint>(
        DATABASE_ID,
        SPRINTS_ID,
        sprintId,
      );

      const member = await getMember({
        databases,
        workspaceId: existing.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (!isWorkspaceAdmin(member)) {
        return c.json({ error: "Forbidden" }, 403);
      }

      const updates: Record<string, unknown> = {};
      if (body.name !== undefined) updates.name = body.name;
      if (body.startDate !== undefined) {
        updates.startDate = body.startDate.toISOString();
      }
      if (body.endDate !== undefined) {
        updates.endDate = body.endDate.toISOString();
      }

      const start =
        body.startDate !== undefined
          ? body.startDate
          : new Date(existing.startDate);
      const end =
        body.endDate !== undefined
          ? body.endDate
          : new Date(existing.endDate);
      if (start > end) {
        return c.json({ error: "Invalid date range" }, 400);
      }

      const sprint = await databases.updateDocument(
        DATABASE_ID,
        SPRINTS_ID,
        sprintId,
        updates,
      );

      return c.json({ data: sprint });
    },
  )
  .delete("/:sprintId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { sprintId } = c.req.param();

    const existing = await databases.getDocument<Sprint>(
      DATABASE_ID,
      SPRINTS_ID,
      sprintId,
    );

    const member = await getMember({
      databases,
      workspaceId: existing.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (!isWorkspaceAdmin(member)) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const linked = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [Query.equal("sprintId", sprintId), Query.limit(500)],
    );

    await Promise.all(
      linked.documents.map((doc) =>
        databases.updateDocument(DATABASE_ID, TASKS_ID, doc.$id, {
          sprintId: null,
        }),
      ),
    );

    await databases.deleteDocument(DATABASE_ID, SPRINTS_ID, sprintId);

    return c.json({ data: { $id: sprintId } });
  });

export default app;
