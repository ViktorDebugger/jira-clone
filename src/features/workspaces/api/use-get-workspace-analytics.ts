import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";
import { InferResponseType } from "hono";

interface UseGetWorkspaceAnalyticsProps {
  workspaceId: string;
}

export type WorkspaceAnalyticsRespoceType = InferResponseType<typeof client.api.workspaces[":workspaceId"]["analytics"]["$get"], 200>

export const useGetWorkspaceAnalytics = ({
  workspaceId,
}: UseGetWorkspaceAnalyticsProps) => {
  const query = useQuery({
    queryKey: ["workspace-analytics", workspaceId],
    queryFn: async () => {
      const responce = await client.api.workspaces[":workspaceId"][
        "analytics"
      ].$get({
        param: { workspaceId },
      });

      if (!responce.ok) {
        throw new Error("Failed to fetch workspace analytics");
      }

      const { data } = await responce.json();

      return data;
    },
  });

  return query;
};
