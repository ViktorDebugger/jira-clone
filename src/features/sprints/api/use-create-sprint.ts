"use client";

import type { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<(typeof client.api.sprints)["$post"], 200>;
type RequestType = InferRequestType<(typeof client.api.sprints)["$post"]>;

export const useCreateSprint = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.sprints.$post({ json });

      if (!response.ok) {
        const errBody = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        throw new Error(
          errBody?.error && typeof errBody.error === "string"
            ? errBody.error
            : "Не вдалося створити спринт",
        );
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Спринт створено");
      queryClient.invalidateQueries({ queryKey: ["sprints"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Не вдалося створити спринт",
      );
    },
  });
};
