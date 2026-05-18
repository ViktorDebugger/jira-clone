import z from "zod";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";

import { DATABASE_ID, COMMENTS_ID, MEMBERS_ID, TASKS_ID } from "@/config";
import type { Comment } from "@/features/comments/types";
import {
  createCommentSchema,
  updateCommentSchema,
} from "@/features/comments/schemas";
import { getMember } from "@/features/members/utils";
import type { Task } from "@/features/tasks/types";
import { createAdminClient } from "@/lib/appwrite";
import { sessionMiddleware } from "@/lib/session-middleware";

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        taskId: z.string().trim().min(1),
      }),
    ),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { taskId } = c.req.valid("query");

      const task = await databases.getDocument<Task>(
        DATABASE_ID,
        TASKS_ID,
        taskId,
      );

      const member = await getMember({
        databases,
        workspaceId: task.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const comments = await databases.listDocuments<Comment>(
        DATABASE_ID,
        COMMENTS_ID,
        [Query.equal("taskId", taskId), Query.orderAsc("$createdAt")],
      );

      const { users } = await createAdminClient();
      const memberIds = [...new Set(comments.documents.map((d) => d.memberId))];
      const membersList =
        memberIds.length > 0
          ? await databases.listDocuments(DATABASE_ID, MEMBERS_ID, [
              Query.contains("$id", memberIds),
            ])
          : { documents: [] as { $id: string; userId: string }[] };

      const profiles = await Promise.all(
        membersList.documents.map(async (mDoc) => {
          const u = await users.get(mDoc.userId);
          return {
            memberId: mDoc.$id,
            name: u.name || "Без імені",
            email: u.email,
          };
        }),
      );

      const profileMap = new Map(profiles.map((p) => [p.memberId, p]));

      const documents = comments.documents.map((doc) => {
        const p = profileMap.get(doc.memberId);
        return {
          ...doc,
          authorName: p?.name ?? "Невідомо",
          authorEmail: p?.email ?? "",
          isOwner: doc.memberId === member.$id,
        };
      });

      return c.json({
        data: {
          ...comments,
          documents,
        },
      });
    },
  )
  .post(
    "/",
    sessionMiddleware,
    zValidator("json", createCommentSchema),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { taskId, body } = c.req.valid("json");

      const task = await databases.getDocument<Task>(
        DATABASE_ID,
        TASKS_ID,
        taskId,
      );

      const member = await getMember({
        databases,
        workspaceId: task.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const doc = await databases.createDocument(
        DATABASE_ID,
        COMMENTS_ID,
        ID.unique(),
        {
          taskId,
          workspaceId: task.workspaceId,
          memberId: member.$id,
          body,
        },
      );

      return c.json({ data: doc });
    },
  )
  .patch(
    "/:commentId",
    sessionMiddleware,
    zValidator("json", updateCommentSchema),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { commentId } = c.req.param();
      const { body } = c.req.valid("json");

      const comment = await databases.getDocument<Comment>(
        DATABASE_ID,
        COMMENTS_ID,
        commentId,
      );

      const member = await getMember({
        databases,
        workspaceId: comment.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (comment.memberId !== member.$id) {
        return c.json({ error: "Forbidden" }, 403);
      }

      const updated = await databases.updateDocument(
        DATABASE_ID,
        COMMENTS_ID,
        commentId,
        { body },
      );

      return c.json({ data: updated });
    },
  )
  .delete("/:commentId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { commentId } = c.req.param();

    const comment = await databases.getDocument<Comment>(
      DATABASE_ID,
      COMMENTS_ID,
      commentId,
    );

    const member = await getMember({
      databases,
      workspaceId: comment.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (comment.memberId !== member.$id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    await databases.deleteDocument(DATABASE_ID, COMMENTS_ID, commentId);

    return c.json({ data: { $id: comment.$id } });
  });

export default app;
