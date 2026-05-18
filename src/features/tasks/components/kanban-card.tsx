import { MoreHorizontalIcon } from "lucide-react";
import { PopulatedTask } from "../types";
import { TaskActions } from "./task-actions";
import { DottedSeparator } from "@/components/dotted-separator";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { TaskDate } from "./task-date";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { TaskTagBadges } from "./task-tag-badges";

interface KanbanCardProps {
  task: PopulatedTask;
}

export const KanbanCard = ({ task }: KanbanCardProps) => {
  return (
    <div className="rounded-lg border border-neutral-700 bg-neutral-800 p-2.5 mb-1.5 shadow-md shadow-black/30 ring-1 ring-neutral-600/60 space-y-3">
      <div className="flex items-center justify-between gap-x-2">
        <p className="text-sm line-clamp-2 text-neutral-100">{task.name}</p>
        <TaskActions id={task.$id} projectId={task.projectId}>
          <MoreHorizontalIcon className="size-[18px] stroke-1 shrink-0 text-neutral-400 hover:opacity-75 transition" />
        </TaskActions>
      </div>
      <TaskTagBadges
        tags={task.tags}
        maxVisible={3}
        className="gap-1"
      />
      <DottedSeparator />
      <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
        <div className="flex shrink-0 -space-x-1 rtl:space-x-reverse">
          {(task.assignees ?? []).slice(0, 4).map((assignee) => (
            <MemberAvatar
              key={assignee.$id}
              name={assignee.name}
              fallbackClassName="text-[10px]"
              className="size-6 ring-2 ring-neutral-800"
            />
          ))}
          {(task.assignees ?? []).length > 4 ? (
            <span className="ml-1 text-[10px] font-medium text-neutral-400">
              +{(task.assignees ?? []).length - 4}
            </span>
          ) : null}
          {(task.assignees ?? []).length === 0 ? (
            <span className="text-[10px] text-neutral-500">—</span>
          ) : null}
        </div>
        <div className="size-1 shrink-0 rounded-full bg-neutral-300" />
        <TaskDate value={task.dueDate} className="text-xs" />
      </div>
      <div className="flex items-center gap-x-1.5">
        <ProjectAvatar
          name={task!.project!.name}
          image={task!.project!.imageUrl}
          fallbackClassName="text-[10px]"
        />
        <span className="text-xs font-medium text-neutral-100">{task!.project!.name}</span>
      </div>
    </div>
  );
};
