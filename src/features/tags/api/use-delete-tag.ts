"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.tags)[":tagId"]["$delete"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.tags)[":tagId"]["$delete"]
>;

export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.tags[":tagId"].$delete({ param });

      if (!response.ok) {
        throw new Error("Failed to delete tag");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Тег видалено");
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => {
      toast.error("Не вдалося видалити тег");
    },
  });
};
