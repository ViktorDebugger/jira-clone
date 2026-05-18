import z from "zod";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";

import { MemberRole, type Member } from "@/features/members/types";
import { getMember } from "@/features/members/utils";

import {
  DATABASE_ID,
  COMMENTS_ID,
  IMAGES_BUCKET_ID,
  MEMBERS_ID,
  PROJECTS_ID,
  SPRINTS_ID,
  TAGS_ID,
  TASKS_ID,
  WORKSPACES_ID,
} from "@/config";
import { sessionMiddleware } from "@/lib/session-middleware";
import { generateInviteCode } from "@/lib/utils";
import { createWorkspaceSchema, updateWorkspaceSchema } from "../schemas";
import { Workspace } from "../types";
import { fetchEnrichedMembersByIds } from "@/features/tasks/server/task-assignee-helpers";
import { createAdminClient } from "@/lib/appwrite";
import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  format,
  parseISO,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import { uk } from "date-fns/locale";
import { Sprint } from "@/features/sprints/types";
import { Tag } from "@/features/tags/types";
import { Comment } from "@/features/comments/types";
import { Project } from "@/features/projects/types";
import { Task, TaskStatus } from "@/features/tasks/types";

const ANALYTICS_CHART_ROWS = 12;
const NO_SPRINT_KEY = "__no_sprint__";
const NO_TAG_KEY = "__no_tags__";
const NO_ASSIGNEE_KEY = "__no_assignee__";

const ANALYTICS_CHART_TASK_LIMIT = 5000;
const ANALYTICS_CHART_COMMENT_LIMIT = 5000;

function parseLocalDateOnly(isoDate: string): Date {
  const [ys, ms, ds] = isoDate.split("-");
  return new Date(Number(ys), Number(ms) - 1, Number(ds));
}

function taskSpanInclusiveDayKeys(task: Task): {
  startKey: string;
  endKey: string;
} {
  const created = parseISO(task.$createdAt);
  const startKey = format(startOfDay(created), "yyyy-MM-dd");
  let endKey = startKey;
  const rawDue = typeof task.dueDate === "string" ? task.dueDate.trim() : "";
  if (rawDue !== "") {
    const due = parseISO(rawDue);
    if (!Number.isNaN(due.getTime())) {
      endKey = format(startOfDay(due), "yyyy-MM-dd");
    }
  }
  if (endKey < startKey) {
    return { startKey: endKey, endKey: startKey };
  }
  return { startKey, endKey };
}

const app = new Hono()
  .get("/", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");

    const members = await databases.listDocuments(DATABASE_ID, MEMBERS_ID, [
      Query.equal("userId", user.$id),
    ]);

    if (members.total === 0) {
      return c.json({ data: { documents: [], total: 0 } });
    }

    const workspaceIds = members.documents.map((member) => member.workspaceId);

    const workspaces = await databases.listDocuments(
      DATABASE_ID,
      WORKSPACES_ID,
      [Query.orderDesc("$createdAt"), Query.contains("$id", workspaceIds)]
    );

    return c.json({ data: workspaces });
  })
  .get("/:workspaceId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { workspaceId } = c.req.param();

    const member = await getMember({
      databases,
      workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const workspace = await databases.getDocument<Workspace>(
      DATABASE_ID,
      WORKSPACES_ID,
      workspaceId
    );

    return c.json({ data: workspace });
  })
  .get("/:workspaceId/info", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const { workspaceId } = c.req.param();

    const workspace = await databases.getDocument<Workspace>(
      DATABASE_ID,
      WORKSPACES_ID,
      workspaceId
    );

    return c.json({
      data: {
        $id: workspace.$id,
        name: workspace.name,
        imageUrl: workspace.imageUrl,
      },
    });
  })
  .post(
    "/",
    zValidator("form", createWorkspaceSchema),
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");

      const { name, image } = c.req.valid("form");

      let uploadedImageUrl: string | undefined;

      if (image instanceof File) {
        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          image
        );

        const arrayBuffer = await storage.getFileView(
          IMAGES_BUCKET_ID,
          file.$id
        );

        uploadedImageUrl = `data:image/png;base64,${Buffer.from(
          arrayBuffer
        ).toString("base64")}`;
      }

      const workspace = await databases.createDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        ID.unique(),
        {
          name,
          userId: user.$id,
          imageUrl: uploadedImageUrl,
          inviteCode: generateInviteCode(6),
        }
      );

      await databases.createDocument(DATABASE_ID, MEMBERS_ID, ID.unique(), {
        userId: user.$id,
        workspaceId: workspace.$id,
        role: MemberRole.ADMIN,
      });

      return c.json({ data: workspace });
    }
  )
  .patch(
    "/:workspaceId",
    sessionMiddleware,
    zValidator("form", updateWorkspaceSchema),
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");

      const { workspaceId } = c.req.param();
      const { name, image } = c.req.valid("form");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member || member.role !== MemberRole.ADMIN) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      let uploadedImageUrl: string | undefined;

      if (image instanceof File) {
        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          image
        );

        const arrayBuffer = await storage.getFileView(
          IMAGES_BUCKET_ID,
          file.$id
        );

        uploadedImageUrl = `data:image/png;base64,${Buffer.from(
          arrayBuffer
        ).toString("base64")}`;
      } else {
        uploadedImageUrl = image;
      }

      const workspace = await databases.updateDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
        { name, imageUrl: uploadedImageUrl }
      );

      return c.json({ data: workspace });
    }
  )
  .delete("/:workspaceId", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");

    const { workspaceId } = c.req.param();

    const member = await getMember({
      databases,
      workspaceId,
      userId: user.$id,
    });

    if (!member || member.role !== MemberRole.ADMIN) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await databases.deleteDocument(DATABASE_ID, WORKSPACES_ID, workspaceId);

    return c.json({ data: { $id: workspaceId } });
  })
  .post("/:workspaceId/reset-invite-code", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");

    const { workspaceId } = c.req.param();

    const member = await getMember({
      databases,
      workspaceId,
      userId: user.$id,
    });

    if (!member || member.role !== MemberRole.ADMIN) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const workspace = await databases.updateDocument(
      DATABASE_ID,
      WORKSPACES_ID,
      workspaceId,
      {
        inviteCode: generateInviteCode(6),
      }
    );

    return c.json({ data: workspace });
  })
  .post(
    "/:workspaceId/join",
    sessionMiddleware,
    zValidator("json", z.object({ code: z.string() })),
    async (c) => {
      const { workspaceId } = c.req.param();
      const { code } = c.req.valid("json");

      const databases = c.get("databases");
      const user = c.get("user");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (member) {
        return c.json({ error: "Already a member" }, 400);
      }

      const workspace = await databases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId
      );

      if (workspace.inviteCode !== code) {
        console.log("my code: ", code);
        console.log("code from db:", workspace.inviteCode);
        return c.json({ error: "Invalid invite code" }, 400);
      }

      await databases.createDocument(DATABASE_ID, MEMBERS_ID, ID.unique(), {
        workspaceId,
        userId: user.$id,
        role: MemberRole.MEMBER,
      });

      return c.json({ data: workspace });
    }
  )
  .get(
    "/:workspaceId/analytics/charts",
    sessionMiddleware,
    zValidator(
      "query",
      z
        .object({
          projectIds: z.string().optional(),
          timelineDays: z.enum(["30", "60", "90"]).optional(),
          timelineFrom: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/)
            .optional(),
          timelineTo: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/)
            .optional(),
          includeTimeline: z.enum(["true", "false"]).optional(),
        })
        .superRefine((data, ctx) => {
          const hasFrom = Boolean(data.timelineFrom);
          const hasTo = Boolean(data.timelineTo);
          if (hasFrom !== hasTo) {
            ctx.addIssue({
              code: "custom",
              message: "timelineRangeIncomplete",
              path: ["timelineFrom"],
            });
            return;
          }
          if (data.timelineFrom && data.timelineTo) {
            const from = startOfDay(parseLocalDateOnly(data.timelineFrom));
            const to = startOfDay(parseLocalDateOnly(data.timelineTo));
            if (from > to) {
              ctx.addIssue({
                code: "custom",
                message: "timelineRangeInverted",
                path: ["timelineFrom"],
              });
            }
            const span = differenceInCalendarDays(to, from);
            if (span > 366) {
              ctx.addIssue({
                code: "custom",
                message: "timelineRangeTooLarge",
                path: ["timelineTo"],
              });
            }
          }
        })
    ),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { workspaceId } = c.req.param();
      const {
        projectIds: projectIdsRaw,
        timelineDays,
        timelineFrom,
        timelineTo,
        includeTimeline: includeTimelineRaw,
      } = c.req.valid("query");

      const includeTimeline = includeTimelineRaw !== "false";

      const timelineDaysParsed: 30 | 60 | 90 =
        timelineDays === undefined
          ? 90
          : (Number(timelineDays) as 30 | 60 | 90);

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const projectIds = (projectIdsRaw ?? "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

      const [projectsInWorkspace, tagsRes, sprintsRes, membersRes] =
        await Promise.all([
          databases.listDocuments<Project>(DATABASE_ID, PROJECTS_ID, [
            Query.equal("workspaceId", workspaceId),
            Query.limit(500),
          ]),
          databases.listDocuments<Tag>(DATABASE_ID, TAGS_ID, [
            Query.equal("workspaceId", workspaceId),
            Query.limit(500),
          ]),
          databases.listDocuments<Sprint>(DATABASE_ID, SPRINTS_ID, [
            Query.equal("workspaceId", workspaceId),
            Query.limit(500),
          ]),
          databases.listDocuments<Member>(DATABASE_ID, MEMBERS_ID, [
            Query.equal("workspaceId", workspaceId),
            Query.limit(500),
          ]),
        ]);

      const taskQueries: string[] = [
        Query.equal("workspaceId", workspaceId),
        Query.limit(ANALYTICS_CHART_TASK_LIMIT),
        Query.orderDesc("$createdAt"),
      ];

      if (projectIds.length === 1) {
        taskQueries.push(Query.equal("projectId", projectIds[0]));
      } else if (projectIds.length > 1) {
        taskQueries.push(
          Query.or(projectIds.map((id) => Query.equal("projectId", id)))
        );
      }

      const tasksRes = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_ID,
        taskQueries
      );
      const tasks = tasksRes.documents;

      let timeline: Array<Record<string, string | number>> = [];
      let timelineTags: Array<{ tagId: string; name: string }> = [];
      let timelineTruncated = false;
      let timelineDaysEcho: number | null = null;
      let timelineRangeFrom: string | null = null;
      let timelineRangeTo: string | null = null;

      if (includeTimeline) {
        const now = new Date();
        let rangeStart: Date;
        let rangeEnd: Date;
        if (timelineFrom && timelineTo) {
          rangeStart = startOfDay(parseLocalDateOnly(timelineFrom));
          rangeEnd = endOfDay(parseLocalDateOnly(timelineTo));
        } else {
          timelineDaysEcho = timelineDaysParsed;
          rangeEnd = endOfDay(now);
          rangeStart = startOfDay(subDays(now, timelineDaysParsed - 1));
        }

        timelineRangeFrom = format(rangeStart, "yyyy-MM-dd");
        timelineRangeTo = format(rangeEnd, "yyyy-MM-dd");

        const timelineTaskQueriesBase: string[] = [
          Query.equal("workspaceId", workspaceId),
          Query.lessThanEqual("$createdAt", rangeEnd.toISOString()),
          Query.greaterThanEqual("dueDate", rangeStart.toISOString()),
        ];

        if (projectIds.length === 1) {
          timelineTaskQueriesBase.push(Query.equal("projectId", projectIds[0]));
        } else if (projectIds.length > 1) {
          timelineTaskQueriesBase.push(
            Query.or(projectIds.map((id) => Query.equal("projectId", id)))
          );
        }

        async function fetchTimelineDocuments(): Promise<{
          documents: Task[];
          truncated: boolean;
        }> {
          const timelineDocs: Task[] = [];
          let cursor: string | undefined;
          let remoteTotal = 0;
          const PAGE = 100;

          for (;;) {
            if (timelineDocs.length >= ANALYTICS_CHART_TASK_LIMIT) {
              break;
            }
            const pageLimit = Math.min(
              PAGE,
              ANALYTICS_CHART_TASK_LIMIT - timelineDocs.length
            );
            const q = [
              ...timelineTaskQueriesBase,
              Query.orderAsc("$createdAt"),
              Query.limit(pageLimit),
            ];
            if (cursor) {
              q.push(Query.cursorAfter(cursor));
            }
            const res = await databases.listDocuments<Task>(
              DATABASE_ID,
              TASKS_ID,
              q
            );
            remoteTotal = res.total;
            timelineDocs.push(...res.documents);
            if (res.documents.length < pageLimit) {
              break;
            }
            cursor = res.documents[res.documents.length - 1]?.$id;
            if (!cursor) {
              break;
            }
          }

          return {
            documents: timelineDocs,
            truncated: remoteTotal > timelineDocs.length,
          };
        }

        const timelinePack = await fetchTimelineDocuments();
        timelineTruncated = timelinePack.truncated;
        const timelineTasks = timelinePack.documents;

        const dayKeys = eachDayOfInterval({
          start: rangeStart,
          end: rangeEnd,
        });

        const workspaceTagIds = new Set(
          tagsRes.documents.map((tag) => tag.$id),
        );
        timelineTags = tagsRes.documents.map((tag) => ({
          tagId: tag.$id,
          name: tag.name,
        }));

        const dayTagCounts = new Map<string, Map<string, number>>();
        for (const d of dayKeys) {
          const dk = format(d, "yyyy-MM-dd");
          const perTag = new Map<string, number>();
          for (const tag of tagsRes.documents) {
            perTag.set(tag.$id, 0);
          }
          dayTagCounts.set(dk, perTag);
        }

        const rangeFirstKey = format(rangeStart, "yyyy-MM-dd");
        const rangeLastKey = format(rangeEnd, "yyyy-MM-dd");

        for (const task of timelineTasks) {
          const { startKey, endKey } = taskSpanInclusiveDayKeys(task);
          const lo = startKey > rangeFirstKey ? startKey : rangeFirstKey;
          const hi = endKey < rangeLastKey ? endKey : rangeLastKey;
          if (lo > hi) {
            continue;
          }
          const taskTagIds = [
            ...new Set(
              (task.tagIds ?? [])
                .map((id) => id.trim())
                .filter(Boolean)
                .filter((id) => workspaceTagIds.has(id)),
            ),
          ];
          if (taskTagIds.length === 0) {
            continue;
          }
          let cursorDay = parseISO(`${lo}T12:00:00`);
          const endAt = parseISO(`${hi}T12:00:00`);
          while (cursorDay.getTime() <= endAt.getTime()) {
            const k = format(cursorDay, "yyyy-MM-dd");
            const perTag = dayTagCounts.get(k);
            if (perTag) {
              for (const tid of taskTagIds) {
                perTag.set(tid, (perTag.get(tid) ?? 0) + 1);
              }
            }
            cursorDay = addDays(cursorDay, 1);
          }
        }

        timeline = dayKeys.map((d) => {
          const yyyyMmDd = format(d, "yyyy-MM-dd");
          const perTag = dayTagCounts.get(yyyyMmDd);
          const row: Record<string, string | number> = {
            period: format(d, "d MMM", { locale: uk }),
            dateKey: yyyyMmDd,
          };
          if (perTag) {
            for (const tag of tagsRes.documents) {
              row[tag.$id] = perTag.get(tag.$id) ?? 0;
            }
          }
          return row;
        });
      }

      const projectNameById = new Map(
        projectsInWorkspace.documents.map((p) => [p.$id, p.name])
      );

      const tagNameById = new Map(
        tagsRes.documents.map((tag) => [tag.$id, tag.name])
      );

      const sprintNameById = new Map(
        sprintsRes.documents.map((sprint) => [sprint.$id, sprint.name])
      );

      const { users } = await createAdminClient();
      const memberMap = await fetchEnrichedMembersByIds(
        databases,
        users,
        workspaceId,
        membersRes.documents.map((m) => m.$id),
      );
      const memberNameById = new Map(
        [...memberMap.entries()].map(([id, member]) => [id, member.name]),
      );

      const byStatus = (Object.values(TaskStatus) as TaskStatus[]).map(
        (status) => ({
          status,
          count: tasks.filter((t) => t.status === status).length,
        })
      );

      const projectCount = new Map<string, number>();
      for (const t of tasks) {
        projectCount.set(t.projectId, (projectCount.get(t.projectId) ?? 0) + 1);
      }
      const byProject = Array.from(projectCount.entries())
        .map(([projectId, count]) => ({
          projectId,
          name: projectNameById.get(projectId) ?? "Невідомий проєкт",
          count,
        }))
        .sort((a, b) => b.count - a.count);

      const sprintCount = new Map<string, number>();
      for (const t of tasks) {
        const raw = typeof t.sprintId === "string" ? t.sprintId.trim() : "";
        const key = raw || NO_SPRINT_KEY;
        sprintCount.set(key, (sprintCount.get(key) ?? 0) + 1);
      }
      const bySprint = Array.from(sprintCount.entries())
        .map(([sprintId, count]) => ({
          sprintId,
          name:
            sprintId === NO_SPRINT_KEY
              ? "Без спринту"
              : sprintNameById.get(sprintId) ?? "Невідомий спринт",
          count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, ANALYTICS_CHART_ROWS);

      const tagCount = new Map<string, number>();
      let tasksWithoutTags = 0;
      for (const t of tasks) {
        const ids = (t.tagIds ?? []).map((id) => id.trim()).filter(Boolean);
        if (ids.length === 0) {
          tasksWithoutTags += 1;
        } else {
          for (const tagId of ids) {
            tagCount.set(tagId, (tagCount.get(tagId) ?? 0) + 1);
          }
        }
      }
      const byTag = Array.from(tagCount.entries())
        .map(([tagId, count]) => ({
          tagId,
          name: tagNameById.get(tagId) ?? "Невідомий тег",
          count,
        }))
        .sort((a, b) => b.count - a.count);
      if (tasksWithoutTags > 0) {
        byTag.push({
          tagId: NO_TAG_KEY,
          name: "Без тегів",
          count: tasksWithoutTags,
        });
        byTag.sort((a, b) => b.count - a.count);
      }
      const byTagTop = byTag.slice(0, ANALYTICS_CHART_ROWS);

      const assigneeCount = new Map<string, number>();
      let tasksWithoutAssignees = 0;
      for (const t of tasks) {
        const ids = [
          ...new Set(
            (t.assigneeIds ?? []).map((id) => id.trim()).filter(Boolean),
          ),
        ];
        if (ids.length === 0) {
          tasksWithoutAssignees += 1;
        } else {
          for (const memberId of ids) {
            assigneeCount.set(
              memberId,
              (assigneeCount.get(memberId) ?? 0) + 1,
            );
          }
        }
      }

      const byAssigneeList = Array.from(assigneeCount.entries())
        .map(([memberId, count]) => ({
          memberId,
          name: memberNameById.get(memberId) ?? "Невідомий учасник",
          count,
        }))
        .sort((a, b) => b.count - a.count);

      if (tasksWithoutAssignees > 0) {
        byAssigneeList.push({
          memberId: NO_ASSIGNEE_KEY,
          name: "Без призначення",
          count: tasksWithoutAssignees,
        });
        byAssigneeList.sort((a, b) => b.count - a.count);
      }

      const byAssignee = byAssigneeList.slice(0, ANALYTICS_CHART_ROWS);

      const taskIdSet = new Set(tasks.map((t) => t.$id));
      let byCommentActivity: Array<{
        memberId: string;
        name: string;
        count: number;
      }> = [];
      let commentsTruncated = false;

      if (taskIdSet.size > 0) {
        const commentCountByMember = new Map<string, number>();
        let commentsRawFetched = 0;
        let commentsRemoteTotal = 0;
        let commentsCursor: string | undefined;
        const COMMENT_PAGE = 100;

        for (;;) {
          if (commentsRawFetched >= ANALYTICS_CHART_COMMENT_LIMIT) {
            break;
          }
          const pageLimit = Math.min(
            COMMENT_PAGE,
            ANALYTICS_CHART_COMMENT_LIMIT - commentsRawFetched,
          );
          const commentQueries: string[] = [
            Query.equal("workspaceId", workspaceId),
            Query.orderDesc("$createdAt"),
            Query.limit(pageLimit),
          ];
          if (commentsCursor) {
            commentQueries.push(Query.cursorAfter(commentsCursor));
          }
          const commentsPage = await databases.listDocuments<Comment>(
            DATABASE_ID,
            COMMENTS_ID,
            commentQueries,
          );
          commentsRemoteTotal = commentsPage.total;
          commentsRawFetched += commentsPage.documents.length;

          for (const doc of commentsPage.documents) {
            if (!taskIdSet.has(doc.taskId)) {
              continue;
            }
            commentCountByMember.set(
              doc.memberId,
              (commentCountByMember.get(doc.memberId) ?? 0) + 1,
            );
          }

          if (commentsPage.documents.length < pageLimit) {
            break;
          }
          commentsCursor =
            commentsPage.documents[commentsPage.documents.length - 1]?.$id;
          if (!commentsCursor) {
            break;
          }
        }

        commentsTruncated = commentsRemoteTotal > commentsRawFetched;

        byCommentActivity = Array.from(commentCountByMember.entries())
          .map(([memberId, count]) => ({
            memberId,
            name: memberNameById.get(memberId) ?? "Невідомий учасник",
            count,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, ANALYTICS_CHART_ROWS);
      }

      return c.json({
        data: {
          totalTasks: tasks.length,
          truncated: tasksRes.total > tasks.length,
          byStatus,
          byProject,
          bySprint,
          byTag: byTagTop,
          byAssignee,
          byCommentActivity,
          commentsTruncated,
          timelineDays: timelineDaysEcho,
          timelineRangeFrom,
          timelineRangeTo,
          timelineTags,
          timeline,
          timelineTruncated,
        },
      });
    }
  )
  .get("/:workspaceId/analytics", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { workspaceId } = c.req.param();

    const member = await getMember({
      databases,
      workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const thisMonthTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("workspaceId", workspaceId),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]
    );

    const lastMonthTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("workspaceId", workspaceId),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ]
    );

    const taskCount = thisMonthTasks.total;
    const taskDifference = taskCount - lastMonthTasks.total;

    const thisMonthAssignedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("workspaceId", workspaceId),
        Query.contains("assigneeIds", member.$id),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]
    );

    const lastMonthAssignedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("workspaceId", workspaceId),
        Query.contains("assigneeIds", member.$id),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ]
    );

    const assignedTaskCount = thisMonthAssignedTasks.total;
    const assignedTaskDifference =
      assignedTaskCount - lastMonthAssignedTasks.total;

    const thisMonthIncompleteTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("workspaceId", workspaceId),
        Query.notEqual("status", TaskStatus.DONE),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]
    );

    const lastMonthIncopleteTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("workspaceId", workspaceId),
        Query.notEqual("status", TaskStatus.DONE),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ]
    );

    const incompleteTaskCount = thisMonthIncompleteTasks.total;
    const incompleteTaskDifference =
      incompleteTaskCount - lastMonthIncopleteTasks.total;

    const thisMonthCompletedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("workspaceId", workspaceId),
        Query.equal("status", TaskStatus.DONE),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]
    );

    const lastMonthCompletedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("workspaceId", workspaceId),
        Query.equal("status", TaskStatus.DONE),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ]
    );

    const completedTaskCount = thisMonthCompletedTasks.total;
    const completedTaskDifference =
      completedTaskCount - lastMonthCompletedTasks.total;

    const thisMonthOverdueTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("workspaceId", workspaceId),
        Query.notEqual("status", TaskStatus.DONE),
        Query.lessThan("dueDate", now.toISOString()),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]
    );

    const lastMonthOverdueTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("workspaceId", workspaceId),
        Query.notEqual("status", TaskStatus.DONE),
        Query.lessThan("dueDate", now.toISOString()),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ]
    );

    const overdueTaskCount = thisMonthOverdueTasks.total;
    const overdueTaskDifference =
      overdueTaskCount - lastMonthOverdueTasks.total;

    return c.json({
      data: {
        taskCount,
        taskDifference,
        assignedTaskCount,
        assignedTaskDifference,
        completedTaskCount,
        completedTaskDifference,
        incompleteTaskCount,
        incompleteTaskDifference,
        overdueTaskCount,
        overdueTaskDifference,
      },
    });
  });

export default app;
