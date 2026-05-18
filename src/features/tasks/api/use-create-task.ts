import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponceType = InferResponseType<(typeof client.api.tasks)["$post"], 200>;
type RequestType = InferRequestType<(typeof client.api.tasks)["$post"]>;

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponceType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const responce = await client.api.tasks["$post"]({ json });

      if (!responce.ok) {
        throw new Error("Failed to create task");
      }

      return await responce.json();
    },
    onSuccess: () => {
      toast.success("Завдання створено");

      queryClient.invalidateQueries({ queryKey: ["workspace-analytics"] });
      queryClient.invalidateQueries({
        queryKey: ["workspace-analytics-charts"],
      });
      queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => {
      toast.error("Не вдалося створити завдання");
    },
  });

  return mutation;
};
