import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponceType = InferResponseType<
  (typeof client.api.workspaces)[":workspaceId"]["join"]["$post"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.workspaces)[":workspaceId"]["join"]["$post"]
>;

export const useJoinWorkspace = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponceType, Error, RequestType>({
    mutationFn: async ({ json, param }) => {
      const responce = await client.api.workspaces[":workspaceId"]["join"][
        "$post"
      ]({ json, param });

      if (!responce.ok) {
        throw new Error("Failed to join workspace");
      }

      return await responce.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Joined workspace");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspace", data.$id] });
    },
    onError: () => {
      toast.error("Failed to join workspace");
    },
  });

  return mutation;
};
