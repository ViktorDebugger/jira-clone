import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetProjectProps {
  projectId: string;
}

export const useGetProject = ({ projectId }: UseGetProjectProps) => {
  const query = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const responce = await client.api.projects[":projectId"].$get({
        param: { projectId },
      });

      if (!responce.ok) {
        throw new Error("Failed to fetch project");
      }

      const { data } = await responce.json();

      return data;
    },
  });

  return query;
};
