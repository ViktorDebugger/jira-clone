"use client";

import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetTagsProps {
  workspaceId: string;
}

export const useGetTags = ({ workspaceId }: UseGetTagsProps) =>
  useQuery({
    enabled: !!workspaceId,
    queryKey: ["tags", workspaceId],
    queryFn: async () => {
      const response = await client.api.tags.$get({
        query: { workspaceId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tags");
      }

      const payload = await response.json();
      return payload.data;
    },
  });
