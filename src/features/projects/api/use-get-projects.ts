import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetProjectsProps {
  workspaceId: string;
}

export const useGetProjects = ({ workspaceId }: UseGetProjectsProps) => {
  const query = useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: async () => {
      const responce = await client.api.projects.$get({
        query: { workspaceId },
      });

      if (!responce.ok) {
        throw new Error("Failed to fetch projects");
      }

      const { data } = await responce.json();

      return data;
    },
  });

  return query;
};
