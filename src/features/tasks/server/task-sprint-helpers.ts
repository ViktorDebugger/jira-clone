import { DATABASE_ID, SPRINTS_ID } from "@/config";
import type { Sprint } from "@/features/sprints/types";
import type { Databases as DatabasesType } from "node-appwrite";
import { Query } from "node-appwrite";

export async function validateSprintForProject(
  databases: DatabasesType,
  sprintId: string | null | undefined,
  workspaceId: string,
  projectId: string,
): Promise<boolean> {
  const id = sprintId?.trim();
  if (!id) return true;

  try {
    const sprint = await databases.getDocument<Sprint>(
      DATABASE_ID,
      SPRINTS_ID,
      id,
    );

    return (
      sprint.workspaceId === workspaceId && sprint.projectId === projectId
    );
  } catch {
    return false;
  }
}

export async function fetchSprintsMapByIds(
  databases: DatabasesType,
  workspaceId: string,
  ids: string[],
): Promise<Map<string, Sprint>> {
  const unique = [...new Set(ids.map((i) => i.trim()).filter(Boolean))];
  if (unique.length === 0) return new Map();

  const list = await databases.listDocuments<Sprint>(
    DATABASE_ID,
    SPRINTS_ID,
    [
      Query.equal("workspaceId", workspaceId),
      Query.contains("$id", unique),
      Query.limit(Math.max(unique.length, 25)),
    ],
  );

  return new Map(list.documents.map((sprint) => [sprint.$id, sprint]));
}

export async function getSprintForTaskPopulate(
  databases: DatabasesType,
  task: {
    sprintId?: string | null;
    workspaceId: string;
    projectId: string;
  },
): Promise<Sprint | null> {
  const sid = task.sprintId?.trim();
  if (!sid) return null;

  try {
    const sprint = await databases.getDocument<Sprint>(
      DATABASE_ID,
      SPRINTS_ID,
      sid,
    );

    if (
      sprint.workspaceId !== task.workspaceId ||
      sprint.projectId !== task.projectId
    ) {
      return null;
    }

    return sprint;
  } catch {
    return null;
  }
}
