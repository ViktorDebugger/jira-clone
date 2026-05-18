import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponceType = InferResponseType<
  (typeof client.api.workspaces)[":workspaceId"]["$delete"], 200
>;
type RequestType = InferRequestType<
  (typeof client.api.workspaces)[":workspaceId"]["$delete"]
>;

export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponceType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const responce = await client.api.workspaces[":workspaceId"]["$delete"]({
        param,
      });

      if (!responce.ok) {
        throw new Error("Failed to delete workspace");
      }

      return await responce.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Робочий простір видалено");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspace", data.$id] });
    },
    onError: () => {
      toast.error("Не вдалося видалити робочий простір");
    },
  });

  return mutation;
};
