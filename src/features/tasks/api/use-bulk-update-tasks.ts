import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponceType = InferResponseType<
  (typeof client.api.tasks)["bulk-update"]["$post"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.tasks)["bulk-update"]["$post"]
>;

export const useBulkUpdateTasks = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponceType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const responce = await client.api.tasks["bulk-update"]["$post"]({
        json,
      });

      if (!responce.ok) {
        throw new Error("Failed to update tasks");
      }

      return await responce.json();
    },
    onSuccess: () => {
      toast.success("Tasks updated");

      queryClient.invalidateQueries({ queryKey: ["workspace-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => {
      toast.error("Failed to update tasks");
    },
  });

  return mutation;
};
