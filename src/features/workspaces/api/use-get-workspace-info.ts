import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetWorkspaceInfoProps {
  workspaceId: string;
}

export const useGetWorkspaceInfo = ({ workspaceId }: UseGetWorkspaceInfoProps) => {
  const query = useQuery({
    queryKey: ["workspace-info", workspaceId],
    queryFn: async () => {
      const responce = await client.api.workspaces[":workspaceId"]["info"].$get({
        param: { workspaceId },
      });

      if (!responce.ok) {
        throw new Error("Failed to fetch workspace info");
      }

      const { data } = await responce.json();

      return data;
    },
  });

  return query;
};
