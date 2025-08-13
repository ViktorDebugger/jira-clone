import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponceType = InferResponseType<
  (typeof client.api.tasks)[":taskId"]["$patch"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.tasks)[":taskId"]["$patch"]
>;

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponceType, Error, RequestType>({
    mutationFn: async ({ json, param }) => {
      const responce = await client.api.tasks[":taskId"]["$patch"]({
        json,
        param,
      });

      if (!responce.ok) {
        throw new Error("Failed to update task");
      }

      return await responce.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Task updated");

      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", data.$id] });
    },
    onError: () => {
      toast.error("Failed to update task");
    },
  });

  return mutation;
};
