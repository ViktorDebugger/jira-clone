import { taskStatusLabelsUk } from "../status-labels";
import { TaskStatus } from "../types";

import {
  CircleCheckIcon,
  CircleDashedIcon,
  CircleDotIcon,
  CircleDotDashedIcon,
  PlusIcon,
  CircleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminOnlyAction } from "@/features/workspaces/components/admin-only-action";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";

interface KanbanColumnHeaderProps {
  board: TaskStatus;
  taskCount: number;
}

const statusIconMap: Record<TaskStatus, React.ReactNode> = {
  [TaskStatus.BACKLOG]: (
    <CircleDashedIcon className="size-[18px] text-neutral-400" />
  ),
  [TaskStatus.TODO]: <CircleIcon className="size-[18px] text-red-500" />,
  [TaskStatus.IN_PROGRESS]: (
    <CircleDotDashedIcon className="size-[18px] text-orange-500" />
  ),
  [TaskStatus.IN_REVIEW]: (
    <CircleDotIcon className="size-[18px] text-red-400" />
  ),
  [TaskStatus.DONE]: (
    <CircleCheckIcon className="size-[18px] text-emerald-500" />
  ),
};

export const KanbanColumnHeader = ({
  board,
  taskCount,
}: KanbanColumnHeaderProps) => {
  const { open } = useCreateTaskModal();

  const icon = statusIconMap[board];

  return (
    <div className="px-2 py-1.5 flex items-center justify-between">
      <div className="flex items-center gap-x-2">
        {icon}
        <h2 className="text-sm font-medium text-neutral-100">
          {taskStatusLabelsUk[board]}
        </h2>
        <div className="size-5 flex items-center justify-center rounded-md bg-neutral-800 text-xs text-neutral-200 font-medium">
          {taskCount}
        </div>
      </div>
      <AdminOnlyAction>
        <Button
          onClick={() => open(board)}
          variant={"ghost"}
          size={"icon"}
          className="size-5"
        >
          <PlusIcon className="size-4 text-neutral-500" />
        </Button>
      </AdminOnlyAction>
    </div>
  );
};
