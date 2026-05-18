"use client";

import type { Tag } from "@/features/tags/types";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TaskTagBadgesProps {
  tags?: Tag[];
  maxVisible?: number;
  className?: string;
  showFullListOnHover?: boolean;
}

interface TagChipProps {
  tag: Tag;
}

function TagChip({ tag }: TagChipProps) {
  return (
    <span
      title={tag.name}
      className="inline-flex max-w-[7rem] shrink-0 items-center truncate rounded border border-black/15 px-1.5 py-0.5 text-[11px] font-medium leading-none text-neutral-950"
      style={{ backgroundColor: tag.color }}
    >
      {tag.name}
    </span>
  );
}

export const TaskTagBadges = ({
  tags,
  maxVisible,
  className,
  showFullListOnHover,
}: TaskTagBadgesProps) => {
  const list = tags ?? [];
  const visible =
    maxVisible !== undefined ? list.slice(0, maxVisible) : list;
  const overflow =
    maxVisible !== undefined ? Math.max(0, list.length - maxVisible) : 0;

  if (!list.length) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }

  const trigger = (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1",
        showFullListOnHover && list.length > 1 && "cursor-default",
        className,
      )}
    >
      {visible.map((tag) => (
        <TagChip key={tag.$id} tag={tag} />
      ))}
      {overflow > 0 ? (
        <span className="text-[11px] text-neutral-400">+{overflow}</span>
      ) : null}
    </div>
  );

  if (showFullListOnHover && list.length > 1) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
        <TooltipContent
          side="top"
          align="start"
          className="max-w-[min(280px,calc(100vw-2rem))]"
        >
          <p className="mb-2 text-xs font-medium text-neutral-400">Усі теги</p>
          <div className="flex flex-wrap gap-1">
            {list.map((tag) => (
              <TagChip key={tag.$id} tag={tag} />
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return trigger;
};
