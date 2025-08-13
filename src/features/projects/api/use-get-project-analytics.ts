import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";
import { InferResponseType } from "hono";

interface UseGetProjectAnalyticsProps {
  projectId: string;
}

export type ProjectAnalyticsRespoceType = InferResponseType<typeof client.api.projects[":projectId"]["analytics"]["$get"], 200>

export const useGetProjectAnalytics = ({
  projectId,
}: UseGetProjectAnalyticsProps) => {
  const query = useQuery({
    queryKey: ["project-analytics", projectId],
    queryFn: async () => {
      const responce = await client.api.projects[":projectId"][
        "analytics"
      ].$get({
        param: { projectId },
      });

      if (!responce.ok) {
        throw new Error("Failed to fetch project analytics");
      }

      const { data } = await responce.json();

      return data;
    },
  });

  return query;
};
