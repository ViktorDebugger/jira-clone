import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetTaskProps {
  taskId: string;
}

export const useGetTask = ({ taskId }: UseGetTaskProps) => {
  const query = useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      const responce = await client.api.tasks[":taskId"].$get({
        param: {
          taskId,
        },
      });

      if (!responce.ok) {
        throw new Error("Failed to fetch task");
      }

      const { data } = await responce.json();

      return data;
    },
  });

  return query;
};
