"use client";

import { useMemo } from "react";

import { useCurrent } from "@/features/auth/api/use-current";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { MemberRole } from "@/features/members/types";

import { useWorkspaceId } from "./use-workspace-id";

export function useWorkspaceAdmin() {
  const workspaceId = useWorkspaceId();
  const { data: user, isLoading: userLoading } = useCurrent();
  const { data: members, isLoading: membersLoading } = useGetMembers({
    workspaceId,
  });

  const isAdmin = useMemo(() => {
    if (!user?.$id || !members?.documents) {
      return false;
    }
    const self = members.documents.find((m) => m.userId === user.$id);
    return self?.role === MemberRole.ADMIN;
  }, [user?.$id, members?.documents]);

  return {
    isAdmin,
    isLoading: userLoading || membersLoading,
  };
}
