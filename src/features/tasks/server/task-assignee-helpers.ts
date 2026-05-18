import { DATABASE_ID, MEMBERS_ID } from "@/config";
import type { Member } from "@/features/members/types";
import type {
  Databases as DatabasesType,
  Users as UsersType,
} from "node-appwrite";
import { Query } from "node-appwrite";

export async function validateAssigneeIdsForWorkspace(
  databases: DatabasesType,
  workspaceId: string,
  assigneeIds: string[],
): Promise<boolean> {
  const unique = [
    ...new Set(assigneeIds.map((id) => id.trim()).filter(Boolean)),
  ];
  if (unique.length === 0) return false;

  const found = await databases.listDocuments(
    DATABASE_ID,
    MEMBERS_ID,
    [
      Query.equal("workspaceId", workspaceId),
      Query.contains("$id", unique),
      Query.limit(Math.max(unique.length, 25)),
    ],
  );

  return found.documents.length === unique.length;
}

export async function fetchEnrichedMembersByIds(
  databases: DatabasesType,
  users: UsersType,
  workspaceId: string,
  ids: string[],
): Promise<Map<string, Member>> {
  const unique = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
  if (unique.length === 0) return new Map();

  const list = await databases.listDocuments<Member>(
    DATABASE_ID,
    MEMBERS_ID,
    [
      Query.equal("workspaceId", workspaceId),
      Query.contains("$id", unique),
      Query.limit(Math.max(unique.length, 25)),
    ],
  );

  const enriched = await Promise.all(
    list.documents.map(async (m) => {
      const u = await users.get(m.userId);
      const filled: Member = {
        ...m,
        name: u.name || "No Name",
        email: u.email,
      };
      return filled;
    }),
  );

  return new Map(enriched.map((m) => [m.$id, m]));
}

export function orderedAssigneesFromMap(
  assigneeIds: string[] | undefined,
  map: Map<string, Member>,
): Member[] {
  const ids = assigneeIds ?? [];
  return ids
    .map((id) => map.get(id))
    .filter((m): m is Member => Boolean(m));
}
