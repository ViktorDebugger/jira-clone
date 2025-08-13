import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponceType = InferResponseType<
  (typeof client.api.projects)[":projectId"]["$patch"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.projects)[":projectId"]["$patch"]
>;

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponceType, Error, RequestType>({
    mutationFn: async ({ form, param }) => {
      const responce = await client.api.projects[":projectId"]["$patch"]({
        form,
        param,
      });

      if (!responce.ok) {
        throw new Error("Failed to update project");
      }

      return await responce.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Project updated");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", data.$id] });
    },
    onError: () => {
      toast.error("Failed to update project");
    },
  });

  return mutation;
};
