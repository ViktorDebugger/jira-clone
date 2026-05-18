import { Button } from "@/components/ui/button";
import { PopulatedTask } from "../types";
import { PencilIcon } from "lucide-react";
import { DottedSeparator } from "@/components/dotted-separator";
import { OverviewProperty } from "./overview-property";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { TaskDate } from "./task-date";
import { Badge } from "@/components/ui/badge";
import { useEditTaskModal } from "../hooks/use-edit-task-modal";
import { taskStatusLabelsUk } from "../status-labels";

interface TaskOverviewProps {
  task: PopulatedTask;
}

export const TaskOverview = ({ task }: TaskOverviewProps) => {
  const { open } = useEditTaskModal();

  return (
    <div className="col-span-1 flex flex-col gap-y-4">
      <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-neutral-100">Огляд</p>
          <Button
            onClick={() => open(task.$id)}
            size={"sm"}
            variant={"secondary"}
          >
            <PencilIcon className="size-4 mr-2" />
            Редагувати
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <div className="flex flex-col gap-y-4">
          <OverviewProperty label="Назва">
            <p className="text-sm font-medium text-neutral-100">{task.name}</p>
          </OverviewProperty>
          <OverviewProperty label="Виконавці">
            {(task.assignees ?? []).length === 0 ? (
              <span className="text-sm text-muted-foreground">—</span>
            ) : (
              <>
                {(task.assignees ?? []).map((member) => (
                  <span
                    key={member.$id}
                    className="inline-flex items-center gap-x-2"
                  >
                    <MemberAvatar
                      name={member.name}
                      className="size-6 shrink-0"
                    />
                    <span className="text-sm font-medium text-neutral-100">
                      {member.name}
                    </span>
                  </span>
                ))}
              </>
            )}
          </OverviewProperty>
          <OverviewProperty label="Спринт">
            {task.sprint ? (
              <p className="text-sm font-medium text-neutral-100">{task.sprint.name}</p>
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}
          </OverviewProperty>
          <OverviewProperty label="Термін виконання">
            <TaskDate value={task.dueDate} className="text-sm font-medium" />
          </OverviewProperty>
          <OverviewProperty label="Статус">
            <Badge variant={task.status}>
              {taskStatusLabelsUk[task.status]}
            </Badge>
          </OverviewProperty>
        </div>
      </div>
    </div>
  );
};
