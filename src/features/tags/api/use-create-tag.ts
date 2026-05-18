"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<(typeof client.api.tags)["$post"], 200>;
type RequestType = InferRequestType<(typeof client.api.tags)["$post"]>;

async function readRpcErrorMessage(response: Response): Promise<string> {
  try {
    const payload: unknown = await response.json();
    if (
      payload &&
      typeof payload === "object" &&
      !Array.isArray(payload)
    ) {
      const obj = payload as Record<string, unknown>;
      const errField = obj.error;
      const msgField = obj.message;
      if (typeof errField === "string" && errField.trim()) {
        return errField;
      }
      if (typeof msgField === "string" && msgField.trim()) {
        return msgField;
      }
    }
  } catch {
    //
  }
  if (
    response.status === 0 ||
    response.status >= 500 ||
    response.status === 404
  ) {
    return "Сервер недоступний або кеш Next.js зламаний. Зупиніть npm run dev (Ctrl+C), видаліть папку .next і знову запустіть npm run dev.";
  }
  if (response.status === 401) {
    return "Потрібна авторизація.";
  }
  return "Не вдалося створити тег";
}

export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.tags.$post({ json });

      if (!response.ok) {
        throw new Error(await readRpcErrorMessage(response));
      }

      return response.json();
    },
    onSuccess: (_data, variables) => {
      toast.success("Тег створено");
      const ws = variables.json.workspaceId;
      queryClient.invalidateQueries({ queryKey: ["tags", ws] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Не вдалося створити тег");
    },
  });
};
