import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

export const useGetWorkspaces = () => {
  const query = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const responce = await client.api.workspaces.$get();

      if (!responce.ok) {
        throw new Error("Failed to fetch workspaces");
      }

      const { data } = await responce.json();

      return data;
    },
  });

  return query;
};
