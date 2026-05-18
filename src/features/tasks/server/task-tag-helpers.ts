import { DATABASE_ID, TAGS_ID } from "@/config";
import type { Tag } from "@/features/tags/types";
import type { Databases as DatabasesType } from "node-appwrite";
import { Query } from "node-appwrite";

export async function validateTaskTagIdsForWorkspace(
  databases: DatabasesType,
  workspaceId: string,
  tagIds: string[],
): Promise<boolean> {
  const unique = [...new Set(tagIds.filter((id) => id.trim()))];
  if (unique.length === 0) {
    return true;
  }

  const found = await databases.listDocuments<Tag>(
    DATABASE_ID,
    TAGS_ID,
    [
      Query.equal("workspaceId", workspaceId),
      Query.contains("$id", unique),
      Query.limit(Math.max(unique.length, 25)),
    ],
  );

  return found.documents.length === unique.length;
}

export async function fetchTagsMapForWorkspace(
  databases: DatabasesType,
  workspaceId: string,
  ids: string[],
): Promise<Map<string, Tag>> {
  const unique = [...new Set(ids.filter((id) => id.trim()))];
  if (!unique.length) {
    return new Map();
  }

  const found = await databases.listDocuments<Tag>(
    DATABASE_ID,
    TAGS_ID,
    [
      Query.equal("workspaceId", workspaceId),
      Query.contains("$id", unique),
      Query.limit(Math.max(unique.length, 25)),
    ],
  );

  return new Map(found.documents.map((tag) => [tag.$id, tag]));
}

export function orderedTagsFromIds(
  tagIds: string[] | undefined,
  tagMap: Map<string, Tag>,
): Tag[] {
  const ids = tagIds ?? [];
  return ids
    .map((id) => tagMap.get(id))
    .filter((tag): tag is Tag => Boolean(tag));
}

export async function fetchTagsOrderedForTask(
  databases: DatabasesType,
  workspaceId: string,
  tagIds: string[] | undefined,
): Promise<Tag[]> {
  const ids = tagIds ?? [];
  const tagMap = await fetchTagsMapForWorkspace(databases, workspaceId, ids);
  return orderedTagsFromIds(ids, tagMap);
}
