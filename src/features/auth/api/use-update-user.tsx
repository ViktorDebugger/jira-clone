import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  typeof client.api.auth.updateProfile.$patch,
  200
>;
type RequestType = InferRequestType<
  typeof client.api.auth.updateProfile.$patch
>["json"];

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.auth.updateProfile.$patch({ json });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Profile updated");

      queryClient.invalidateQueries();
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  return mutation;
};
