"use client";

import { ChevronDownIcon, Loader, TagIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { useGetTags } from "@/features/tags/api/use-get-tags";
import type { Tag } from "@/features/tags/types";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

import { useTaskFilters } from "../hooks/use-tasks-filters";

interface TaskTagFilterProps {
  className?: string;
}

export const TaskTagFilter = ({ className }: TaskTagFilterProps) => {
  const workspaceId = useWorkspaceId();
  const { data: tagsPayload, isLoading } = useGetTags({ workspaceId });
  const [{ tagIds }, setFilters] = useTaskFilters();

  const selected = tagIds ?? [];
  const tagDocs = tagsPayload?.documents ?? [];

  const toggle = (id: string) => {
    const next = selected.includes(id)
      ? selected.filter((x) => x !== id)
      : [...selected, id];
    setFilters({ tagIds: next.length ? next : null });
  };

  const clear = () => setFilters({ tagIds: null });

  const label =
    selected.length === 0 ? "Усі теги" : `Теги: ${selected.length}`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "h-8 w-full max-h-8 justify-between border-neutral-700 py-0 shadow-none lg:w-auto",
            selected.length === 0 ? "text-neutral-500" : "text-neutral-100",
            className,
          )}
        >
          <span className="flex min-w-0 flex-1 items-center gap-2 pr-2">
            <TagIcon
              className="size-4 shrink-0 text-neutral-400"
              aria-hidden
            />
            <span className="truncate">{label}</span>
          </span>
          <ChevronDownIcon className="size-4 shrink-0 opacity-50" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(280px,calc(100vw-2rem))] overflow-hidden border-neutral-800 bg-neutral-950 p-0 text-neutral-100 shadow-xl"
      >
        {selected.length > 0 ? (
          <div className="border-b border-neutral-800 px-2 py-1.5">
            <button
              type="button"
              className="w-full rounded-md px-2 py-1 text-left text-xs text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100"
              onClick={() => clear()}
            >
              Очистити фільтр
            </button>
          </div>
        ) : null}
        {isLoading ? (
          <div className="flex h-28 items-center justify-center">
            <Loader className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : tagDocs.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">
            Немає тегів. Створіть їх у налаштуваннях робочого простору.
          </p>
        ) : (
          <div className="chart-legend-scroll max-h-[min(14rem,50vh)] min-h-0 overflow-y-auto overscroll-contain">
            <ul className="flex flex-col gap-1 p-2" role="listbox">
              {tagDocs.map((tag: Tag) => {
                const checked = selected.includes(tag.$id);
                return (
                  <li key={tag.$id}>
                    <Label
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-neutral-900",
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggle(tag.$id)}
                        aria-labelledby={`filter-tag-${tag.$id}-label`}
                      />
                      <span
                        id={`filter-tag-${tag.$id}-label`}
                        className="inline-flex min-w-0 flex-1 items-center gap-2 text-sm"
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
