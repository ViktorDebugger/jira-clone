"use client";

import {
  cloneElement,
  isValidElement,
  type MouseEvent,
  type ReactElement,
} from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { useWorkspaceAdmin } from "@/features/workspaces/hooks/use-workspace-admin";

export const ADMIN_ONLY_ACTION_MESSAGE =
  "Цю дію може виконати лише адміністратор";

interface AdminOnlyActionChildProps {
  className?: string;
}

interface AdminOnlyActionProps {
  children: ReactElement<AdminOnlyActionChildProps>;
  className?: string;
}

export function AdminOnlyAction({ children, className }: AdminOnlyActionProps) {
  const { isAdmin, isLoading } = useWorkspaceAdmin();
  const locked = !isAdmin || isLoading;

  if (!locked) {
    return children;
  }

  if (!isValidElement(children)) {
    return children;
  }

  const blockedChild = cloneElement(children, {
    disabled: true,
    "aria-disabled": true,
    tabIndex: -1,
    onClick: (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
    },
    className: cn(children.props.className, "opacity-50"),
  } as Record<string, unknown>);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn("inline-flex cursor-not-allowed", className)}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          {blockedChild}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">{ADMIN_ONLY_ACTION_MESSAGE}</TooltipContent>
    </Tooltip>
  );
}
