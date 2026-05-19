"use client";

import { useWorkspaceId } from "../hooks/use-workspace-id";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, MoreVerticalIcon } from "lucide-react";
import Link from "next/link";
import { DottedSeparator } from "@/components/dotted-separator";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { Fragment } from "react";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { Separator } from "@/components/ui/separator";
import { useDeleteMember } from "@/features/members/api/use-delete-member";
import { useUpdateMember } from "@/features/members/api/use-update-member";
import { MemberRole, memberRoleLabelsUk } from "@/features/members/types";
import { useConfirm } from "@/hooks/use-confirm";
import { useWorkspaceAdmin } from "@/features/workspaces/hooks/use-workspace-admin";

interface MembersListProps {
  email: string;
}

export const MembersList = ({ email }: MembersListProps) => {
  const workspaceId = useWorkspaceId();
  const { isAdmin } = useWorkspaceAdmin();
  const { data } = useGetMembers({ workspaceId });
  const [ConfirmDialog, confirm] = useConfirm(
    "Видалити учасника",
    "Цього учасника буде видалено з робочого простору",
    "destructive"
  );

  const { mutate: deleteMember, isPending: isDeletingMember } =
    useDeleteMember();

  const { mutate: updateMember, isPending: isUpdatingMember } =
    useUpdateMember();

  const handleUpdateMember = (memberId: string, role: MemberRole) => {
    updateMember({
      json: { role },
      param: { memberId },
    });
  };

  const handleDeleteMember = async (memberId: string) => {
    const ok = await confirm();
    if (!ok) return;

    deleteMember(
      { param: { memberId } },
      {
        onSuccess: () => {
          window.location.reload();
        },
      }
    );
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <ConfirmDialog />
      <CardHeader className="flex flex-row flex-wrap items-center gap-3 space-y-0 p-4">
        <Button asChild variant={"secondary"} size={"sm"} className="shrink-0">
          <Link href={`/workspaces/${workspaceId}`}>
            <ArrowLeftIcon className="size-4 mr-2" />
            Назад
          </Link>
        </Button>
        <CardTitle className="min-w-0 flex-1 text-xl font-bold text-neutral-100">
          Список учасників
        </CardTitle>
      </CardHeader>
      <div className="px-4">
        <DottedSeparator />
      </div>
      <CardContent className="p-4">
        {data?.documents.map((member, index) => {
          const isSelf = member.email === email;
          const showActionsMenu = isAdmin && !isSelf;

          return (
          <Fragment key={member.$id}>
            <div className="flex items-center gap-4">
              <MemberAvatar
                className="size-10"
                fallbackClassName="text-lg"
                name={member.name}
              />
              <div className="flex flex-col w-full">
                <div className="flex text-sm items-center justify-between">
                  <span className="font-medium flex gap-4 items-center">
                    {member.name}
                    {isSelf && (
                      <span className="text-xs text-neutral-400">(Ви)</span>
                    )}
                  </span>

                  <span className="text-neutral-500 text-xs">
                    {memberRoleLabelsUk[member.role]}
                  </span>
                </div>
                <p className="text-xs text-neutral-400">{member.email}</p>
              </div>
              {showActionsMenu ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="ml-auto"
                      variant={"secondary"}
                      size={"icon"}
                      aria-label={`Дії для ${member.name}`}
                    >
                      <MoreVerticalIcon className="size-4 text-neutral-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="bottom" align="end">
                    <DropdownMenuItem
                      className="font-medium"
                      onClick={() =>
                        handleUpdateMember(
                          member.$id,
                          member.role === MemberRole.ADMIN
                            ? MemberRole.MEMBER
                            : MemberRole.ADMIN,
                        )
                      }
                      disabled={isUpdatingMember}
                    >
                      {member.role === MemberRole.ADMIN
                        ? "Зробити учасником"
                        : "Зробити адміністратором"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      className="font-medium"
                      onClick={() => handleDeleteMember(member.$id)}
                      disabled={isDeletingMember}
                    >
                      Видалити {member.name}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
            {index < data.documents.length - 1 && (
              <Separator className="my-2.5 bg-neutral-800" />
            )}
          </Fragment>
          );
        })}
      </CardContent>
    </Card>
  );
};
