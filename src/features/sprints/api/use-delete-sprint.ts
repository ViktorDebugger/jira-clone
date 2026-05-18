"use client";

import type { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.sprints)[":sprintId"]["$delete"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.sprints)[":sprintId"]["$delete"]
>;

export const useDeleteSprint = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.sprints[":sprintId"]["$delete"]({
        param,
      });

      if (!response.ok) {
        throw new Error("Не вдалося видалити спринт");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Спринт видалено");
      queryClient.invalidateQueries({ queryKey: ["sprints"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => {
      toast.error("Не вдалося видалити спринт");
    },
  });
};
