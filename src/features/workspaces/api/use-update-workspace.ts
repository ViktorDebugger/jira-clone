import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponceType = InferResponseType<
  (typeof client.api.workspaces)[":workspaceId"]["$patch"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.workspaces)[":workspaceId"]["$patch"]
>;

export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponceType, Error, RequestType>({
    mutationFn: async ({ form, param }) => {
      const responce = await client.api.workspaces[":workspaceId"]["$patch"]({
        form,
        param,
      });

      if (!responce.ok) {
        throw new Error("Failed to update workspace");
      }

      return await responce.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Workspace updated");

      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspaces", data.$id] });
    },
    onError: () => {
      toast.error("Failed to update workspace");
    },
  });

  return mutation;
};
