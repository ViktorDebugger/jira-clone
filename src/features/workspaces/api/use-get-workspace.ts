import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetWorkspaceProps {
  workspaceId: string;
}

export const useGetWorkspace = ({ workspaceId }: UseGetWorkspaceProps) => {
  const query = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      const responce = await client.api.workspaces[":workspaceId"].$get({
        param: { workspaceId },
      });

      if (!responce.ok) {
        throw new Error("Failed to fetch workspace");
      }

      const { data } = await responce.json();

      return data;
    },
  });

  return query;
};
