"use client";

import { useRouter } from "next/navigation";

import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useJoinWorkspace } from "../api/use-join-workspace";
import { useInviteCode } from "../hooks/use-invite-code";
import { useWorkspaceId } from "../hooks/use-workspace-id";

interface JoinWorkspaceFormProps {
  initialValues: {
    name: string;
  };
}

export const JoinWorkspaceForm = ({
  initialValues,
}: JoinWorkspaceFormProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const inviteCode = useInviteCode();
  const { mutate, isPending } = useJoinWorkspace();

  const onSubmit = () => {
    mutate(
      {
        param: { workspaceId },
        json: { code: inviteCode },
      },
      {
        onSuccess: ({ data }) => {
          router.push(`/workspaces/${data.$id}`);
        },
      }
    );
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="p-4">
        <CardTitle className="text-xl font-bold">Приєднатися до робочого простору</CardTitle>
        <CardDescription>
          Вас запросили приєднатися до робочого простору{" "}
          <strong>{initialValues.name}</strong>
        </CardDescription>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>

      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-2  items-center justify-between">
          <Button
            variant={"secondary"}
            type="button"
            size={"lg"}
            asChild
            className="w-full lg:w-fit"
            disabled={isPending}
          >
            <Link href="/">Скасувати</Link>
          </Button>
          <Button
            size={"lg"}
            className="w-full lg:w-fit"
            type="button"
            onClick={onSubmit}
            disabled={isPending}
          >
            Приєднатися
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
