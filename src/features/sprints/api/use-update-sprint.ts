"use client";

import type { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.sprints)[":sprintId"]["$patch"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.sprints)[":sprintId"]["$patch"]
>;

export const useUpdateSprint = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json, param }) => {
      const response = await client.api.sprints[":sprintId"]["$patch"]({
        json,
        param,
      });

      if (!response.ok) {
        const errBody = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        throw new Error(
          errBody?.error && typeof errBody.error === "string"
            ? errBody.error
            : "Не вдалося оновити спринт",
        );
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Спринт оновлено");
      queryClient.invalidateQueries({ queryKey: ["sprints"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Не вдалося оновити спринт",
      );
    },
  });
};
