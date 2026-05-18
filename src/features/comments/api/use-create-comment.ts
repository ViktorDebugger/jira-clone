import type { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<(typeof client.api.comments)["$post"], 200>;
type RequestType = InferRequestType<(typeof client.api.comments)["$post"]>;

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.comments["$post"]({ json });

      if (!response.ok) {
        throw new Error("Failed to create comment");
      }

      return response.json();
    },
    onSuccess: (_data, variables) => {
      toast.success("Коментар додано");
      const taskId =
        typeof variables.json?.taskId === "string"
          ? variables.json.taskId
          : undefined;
      if (taskId) {
        queryClient.invalidateQueries({ queryKey: ["comments", taskId] });
      }
    },
    onError: () => {
      toast.error("Не вдалося додати коментар");
    },
  });
};
