import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponceType = InferResponseType<(typeof client.api.auth.login)["$post"]>;
type RequestType = InferRequestType<(typeof client.api.auth.login)["$post"]>;

export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponceType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const responce = await client.api.auth.login["$post"]({ json });

      if (!responce.ok) {
        throw new Error("Failed to log in");
      }

      return await responce.json();
    },
    onSuccess: () => {
      toast.success("Logged in");
      router.refresh();
      queryClient.invalidateQueries({ queryKey: ["current"] });
    },
    onError: () => {
      toast.error("Failed to log in");
    },
  });

  return mutation;
};
