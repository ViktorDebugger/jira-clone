import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { client } from "@/lib/rpc";

interface UseUpdateCommentPayload {
  commentId: string;
  body: string;
  taskId: string;
}

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation<object, Error, UseUpdateCommentPayload>({
    mutationFn: async ({ commentId, body }) => {
      const response = await client.api.comments[":commentId"]["$patch"]({
        param: { commentId },
        json: { body },
      });

      if (!response.ok) {
        throw new Error("Failed to update comment");
      }

      return response.json();
    },
    onSuccess: (_data, vars) => {
      toast.success("Коментар оновлено");
      queryClient.invalidateQueries({
        queryKey: ["comments", vars.taskId],
      });
    },
    onError: () => {
      toast.error("Не вдалося оновити коментар");
    },
  });
};
