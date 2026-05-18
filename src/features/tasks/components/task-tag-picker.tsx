"use client";

import { Loader, TagIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGetTags } from "@/features/tags/api/use-get-tags";
import type { Tag } from "@/features/tags/types";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { cn } from "@/lib/utils";

interface TaskTagPickerProps {
  value: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  id?: string;
}

export const TaskTagPicker = ({
  value,
  onChange,
  disabled,
  id,
}: TaskTagPickerProps) => {
  const workspaceId = useWorkspaceId();
  const { data: tagsPayload, isLoading } = useGetTags({ workspaceId });
  const tagDocuments = tagsPayload?.documents ?? [];

  const toggle = (tagId: string) => {
    if (disabled) return;
    if (value.includes(tagId)) {
      onChange(value.filter((tid) => tid !== tagId));
    } else {
      onChange([...value, tagId]);
    }
  };

  const labelForSelected = (): string => {
    if (!value.length) return "Оберіть теги…";
    if (tagDocuments.length === 0 && value.length) {
      return `Обрано: ${value.length}`;
    }

    const nameById = new Map(tagDocuments.map((t: Tag) => [t.$id, t.name]));
    const names = value
      .map((tid) => nameById.get(tid))
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
          <TagIcon className="mr-2 size-4 shrink-0 opacity-70" aria-hidden />
          <span className="truncate text-left">{labelForSelected()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="min-w-[min(280px,100vw-2rem)] overflow-hidden border-neutral-800 bg-neutral-950 p-0 text-neutral-100 shadow-xl"
      >
        {isLoading ? (
          <div className="flex h-28 items-center justify-center">
            <Loader className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : tagDocuments.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">
            Немає тегів. Створіть тег через кнопку «Тег».
          </p>
        ) : (
          <div className="chart-legend-scroll max-h-[min(14rem,50vh)] min-h-0 overflow-y-auto overscroll-contain">
            <ul className="flex flex-col gap-1 p-2" role="listbox">
              {tagDocuments.map((tag: Tag) => {
                const checked = value.includes(tag.$id);
                return (
                  <li key={tag.$id}>
                    <Label
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-neutral-900",
                        disabled && "pointer-events-none opacity-60",
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={() => toggle(tag.$id)}
                        aria-labelledby={`task-tag-${tag.$id}-label`}
                      />
                      <span
                        id={`task-tag-${tag.$id}-label`}
                        className="inline-flex min-w-0 flex-1 items-center gap-2"
                      >
                        <span
                          className="inline-block size-3 shrink-0 rounded border border-neutral-700"
                          style={{ backgroundColor: tag.color }}
                          aria-hidden
                        />
                        <span className="truncate">{tag.name}</span>
                      </span>
                    </Label>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
