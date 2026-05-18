"use client";

import { Loader, UserIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import type { Member } from "@/features/members/types";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { cn } from "@/lib/utils";
import { useCurrent } from "@/features/auth/api/use-current";

interface TaskMemberPickerProps {
  value: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  id?: string;
}

export const TaskMemberPicker = ({
  value,
  onChange,
  disabled,
  id,
}: TaskMemberPickerProps) => {
  const workspaceId = useWorkspaceId();
  const { data: membersPayload, isLoading } = useGetMembers({ workspaceId });
  const documents = membersPayload?.documents ?? [];
  const { data: authUser } = useCurrent();

  const toggle = (memberId: string) => {
    if (disabled) return;
    if (value.includes(memberId)) {
      onChange(value.filter((idItem) => idItem !== memberId));
    } else {
      onChange([...value, memberId]);
    }
  };

  const labelForSelected = (): string => {
    if (!value.length) return "Оберіть виконавців…";

    const nameById = new Map(documents.map((m: Member) => [m.$id, m.name]));
    const names = value
      .map((mid) => nameById.get(mid))
      .filter((n): n is string => typeof n === "string");

    const preview = names.slice(0, 2).join(", ");
    const more = names.length > 2 ? ` +${names.length - 2}` : "";

    return names.length ? `${preview}${more}` : `Обрано: ${value.length}`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-10 w-full justify-start border-neutral-800 bg-transparent font-normal text-neutral-100",
          )}
          id={id}
        >
          <UserIcon className="mr-2 size-4 shrink-0 opacity-70" aria-hidden />
          <span className="truncate text-left">{labelForSelected()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="min-w-[min(280px,100vw-2rem)] border-neutral-800 bg-neutral-950 p-0 text-neutral-100 shadow-xl"
      >
        {isLoading ? (
          <div className="flex h-28 items-center justify-center">
            <Loader className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : documents.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">
            Немає учасників у робочій області.
          </p>
        ) : (
          <ScrollArea className="h-56">
            <ul className="flex flex-col gap-1 p-2" role="listbox">
              {documents.map((member: Member) => {
                const checked = value.includes(member.$id);
                return (
                  <li key={member.$id}>
                    <Label
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-neutral-900",
                        disabled && "pointer-events-none opacity-60",
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={() => toggle(member.$id)}
                        aria-labelledby={`task-member-${member.$id}-label`}
                      />
                      <span
                        id={`task-member-${member.$id}-label`}
                        className="inline-flex min-w-0 flex-1 items-center gap-2"
                      >
                        <MemberAvatar name={member.name} className="size-7" />
                        <span className="truncate">
                          {member.name}
                          {authUser?.email &&
                            member.email === authUser.email && (
                              <span className="ml-1 text-xs text-muted-foreground">
                                (Ви)
                              </span>
                            )}
                        </span>
                      </span>
                    </Label>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
};
