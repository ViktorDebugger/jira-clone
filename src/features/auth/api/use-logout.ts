import { toast } from "sonner";

import { useRouter } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponceType = InferResponseType<(typeof client.api.auth.logout)["$post"]>;

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponceType, Error>({
    mutationFn: async () => {
      const responce = await client.api.auth.logout["$post"]();

      if (!responce.ok) {
        throw new Error("Failed to log out");
      }

      return await responce.json();
    },
    onSuccess: () => {
      toast.success("Ви вийшли з облікового запису");
      router.refresh();

      queryClient.invalidateQueries();
    },
    onError: () => {
      toast.error("Не вдалося вийти");
    },
  });

  return mutation;
};
