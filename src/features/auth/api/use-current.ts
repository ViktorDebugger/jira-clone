import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

export const useCurrent = () => {
  const query = useQuery({
    queryKey: ["current"],
    queryFn: async () => {
      const responce = await client.api.auth.current.$get();

      if (!responce.ok) {
        return null;
      }

      const { data } = await responce.json();

      return data;
    },
  });

  return query;
};
