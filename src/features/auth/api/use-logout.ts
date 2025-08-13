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
      toast.success("Loggen out");
      router.refresh();
      queryClient.invalidateQueries({ queryKey: ["current"] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
    onError: () => {
      toast.error("Failed to log out");
    },
  });

  return mutation;
};
