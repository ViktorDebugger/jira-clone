import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";
import { PopulatedTask } from "../types";
import { Button } from "@/components/ui/button";
import { AdminOnlyAction } from "@/features/workspaces/components/admin-only-action";
import { CalendarIcon, PlusIcon } from "lucide-react";
import { DottedSeparator } from "@/components/dotted-separator";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface TaskListProps {
  data: PopulatedTask[];
  total: number;
}

export const TaskList = ({ data, total }: TaskListProps) => {
  const { open: createTask } = useCreateTaskModal();
  const workspaceId = useWorkspaceId();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-neutral-800 bg-neutral-900 p-4 xl:min-h-full">
        <div className="flex shrink-0 items-center justify-between">
          <p className="text-lg font-semibold text-neutral-100">Завдання ({total})</p>
          <AdminOnlyAction>
            <Button
              variant={"secondary"}
              size={"icon"}
              onClick={() => createTask()}
            >
              <PlusIcon className="size-4 text-neutral-400" />
            </Button>
          </AdminOnlyAction>
        </div>
        <DottedSeparator className="my-4 shrink-0" />
        <ul className="flex min-h-0 flex-1 flex-col gap-y-4 overflow-y-auto">
          {data.map((task) => (
            <li key={task.$id}>
              <Link href={`/workspaces/${workspaceId}/tasks/${task.$id}`}>
                <Card className="shadow-none rounded-lg hover:opacity-75 transition">
                  <CardContent className="px-4 py-3.5">
                    <p className="text-lg font-medium truncate">{task.name}</p>
                    <div className="flex items-center gap-x-2">
                      <p>{task.project?.name}</p>
                      <div className="size-1 rounded-full bg-neutral-300" />
                      <div className="text-sm text-muted-foreground flex items-center">
                        <CalendarIcon className="size-3 mr-1" />
                        <span className="truncate">
                          {formatDistanceToNow(new Date(task.dueDate))}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
          <li className="text-sm text-neutral-400 text-center hidden first-of-type:block">
            Завдання не знайдено
          </li>
        </ul>
        <Button variant={"secondary"} className="mt-4 w-full shrink-0" asChild>
          <Link href={`/workspaces/${workspaceId}/tasks`}>Показати всі</Link>
        </Button>
      </div>
    </div>
  );
};
