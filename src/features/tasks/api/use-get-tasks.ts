import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";
import { TasksResponse, TaskStatus } from "../types";

interface UseGetTasksProps {
  workspaceId: string;
  projectId?: string | null;
  status?: TaskStatus | null;
  search?: string | null;
  assigneeId?: string | null;
  dueDate?: string | null;
  tagIds?: string[] | null;
}

export const useGetTasks = ({
  workspaceId,
  projectId,
  status,
  search,
  assigneeId,
  dueDate,
  tagIds,
}: UseGetTasksProps) => {
  const tagIdsSorted =
    tagIds && tagIds.length > 0 ? [...tagIds].sort().join(",") : null;

  const query = useQuery({
    queryKey: [
      "tasks",
      workspaceId,
      projectId,
      status,
      search,
      assigneeId,
      dueDate,
      tagIdsSorted,
    ],
    queryFn: async () => {
      const responce = await client.api.tasks.$get({
        query: {
          workspaceId,
          projectId: projectId ?? undefined,
          status: status ?? undefined,
          search: search ?? undefined,
          assigneeId: assigneeId ?? undefined,
          dueDate: dueDate ?? undefined,
          tagIds: tagIdsSorted ?? undefined,
        },
      });

      if (!responce.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const { data } = await responce.json();

      return data as TasksResponse;
    },
  });

  return query;
};
