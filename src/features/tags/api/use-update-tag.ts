"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.tags)[":tagId"]["$patch"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.tags)[":tagId"]["$patch"]
>;

export const useUpdateTag = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json, param }) => {
      const response = await client.api.tags[":tagId"].$patch({ json, param });

      if (!response.ok) {
        throw new Error("Failed to update tag");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Тег оновлено");
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => {
      toast.error("Не вдалося оновити тег");
    },
  });
};
