import type { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.comments)[":commentId"]["$delete"],
  200
>;

interface UseDeleteCommentPayload {
  commentId: string;
  taskId: string;
}

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, UseDeleteCommentPayload>({
    mutationFn: async ({ commentId }) => {
      const response = await client.api.comments[":commentId"]["$delete"]({
        param: { commentId },
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      return response.json();
    },
    onSuccess: (_data, vars) => {
      toast.success("Коментар видалено");
      queryClient.invalidateQueries({
        queryKey: ["comments", vars.taskId],
      });
    },
    onError: () => {
      toast.error("Не вдалося видалити коментар");
    },
  });
};
