"use client";

import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetSprintsProps {
  workspaceId: string;
  projectId: string;
}

export const useGetSprints = ({
  workspaceId,
  projectId,
}: UseGetSprintsProps) =>
  useQuery({
    enabled: !!workspaceId && !!projectId,
    queryKey: ["sprints", workspaceId, projectId],
    queryFn: async () => {
      const response = await client.api.sprints.$get({
        query: { workspaceId, projectId },
      });

      if (!response.ok) {
        throw new Error("Не вдалося завантажити спринти");
      }

      const payload = await response.json();

      return payload.data;
    },
  });
