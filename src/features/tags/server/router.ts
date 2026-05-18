import { DATABASE_ID, TAGS_ID } from "@/config";
import { getMember, isWorkspaceAdmin } from "@/features/members/utils";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import z from "zod";

import { createTagSchema, updateTagSchema } from "../schemas";
import type { Tag } from "../types";

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    zValidator("query", z.object({ workspaceId: z.string() })),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { workspaceId } = c.req.valid("query");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const tags = await databases.listDocuments<Tag>(
        DATABASE_ID,
        TAGS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.orderAsc("name"),
          Query.limit(500),
        ],
      );

      return c.json({ data: tags });
    },
  )
  .post(
    "/",
    sessionMiddleware,
    zValidator("json", createTagSchema),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { workspaceId, name, color } = c.req.valid("json");

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

      const tag = await databases.createDocument(
        DATABASE_ID,
        TAGS_ID,
        ID.unique(),
        {
          workspaceId,
          name,
          color,
        },
      );

      return c.json({ data: tag });
    },
  )
  .patch(
    "/:tagId",
    sessionMiddleware,
    zValidator("json", updateTagSchema),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { tagId } = c.req.param();
      const { name, color } = c.req.valid("json");

      const existing = await databases.getDocument<Tag>(
        DATABASE_ID,
        TAGS_ID,
        tagId,
      );

      const member = await getMember({
        databases,
        workspaceId: existing.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const updated = await databases.updateDocument(
        DATABASE_ID,
        TAGS_ID,
        tagId,
        {
          name,
          color,
        },
      );

      return c.json({ data: updated });
    },
  )
  .delete("/:tagId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { tagId } = c.req.param();

    const existing = await databases.getDocument<Tag>(
      DATABASE_ID,
      TAGS_ID,
      tagId,
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

    await databases.deleteDocument(DATABASE_ID, TAGS_ID, tagId);

    return c.json({ data: { $id: tagId } });
  });

export default app;
