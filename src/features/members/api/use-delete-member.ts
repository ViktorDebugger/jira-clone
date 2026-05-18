import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponceType = InferResponseType<
  (typeof client.api.members)[":memberId"]["$delete"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.members)[":memberId"]["$delete"]
>;

export const useDeleteMember = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponceType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const responce = await client.api.members[":memberId"]["$delete"]({
        param,
      });

      if (!responce.ok) {
        throw new Error("Failed to delete member");
      }

      return await responce.json();
    },
    onSuccess: () => {
      toast.success("Учасника видалено з робочого простору");
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: () => {
      toast.error("Не вдалося видалити учасника");
    },
  });

  return mutation;
};
