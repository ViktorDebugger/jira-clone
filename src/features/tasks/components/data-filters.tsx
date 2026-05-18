import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

import { DatePicker } from "@/components/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FolderIcon, ListChecksIcon, UserIcon } from "lucide-react";

import {
  taskStatusLabelsUk,
  taskStatusesOrdered,
} from "@/features/tasks/status-labels";
import { TaskStatus } from "../types";
import { useTaskFilters } from "../hooks/use-tasks-filters";
import { useCurrent } from "@/features/auth/api/use-current";
import { TaskTagFilter } from "./task-tag-filter";

interface DataFiltersProps {
  hideProjectFilter?: boolean;
}

export const DataFilters = ({ hideProjectFilter }: DataFiltersProps) => {
  const workspaceId = useWorkspaceId();

  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({
    workspaceId,
  });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({
    workspaceId,
  });

  const isLoading = isLoadingProjects || isLoadingMembers;

  const projectOptions = projects?.documents.map((project) => ({
    value: project.$id,
    label: project.name,
  }));

  const memberOptions = members?.documents.map((member) => ({
    value: member.$id,
    label: member.name,
    email: member.email,
  }));

  const [{ status, assigneeId, projectId, dueDate }, setFilters] =
    useTaskFilters();

  const onStatusChange = (value: string) => {
    setFilters({ status: value === "all" ? null : (value as TaskStatus) });
  };

  const onAssigneeChange = (value: string) => {
    setFilters({ assigneeId: value === "all" ? null : (value as string) });
  };

  const onProjectChange = (value: string) => {
    setFilters({ projectId: value === "all" ? null : (value as string) });
  };

  const { data: user } = useCurrent();

  if (isLoading) return null;

  if (!user) return;

  return (
    <div className="flex flex-col lg:flex-row gap-2">
      <Select
        defaultValue={status ?? undefined}
        onValueChange={(value) => onStatusChange(value)}
      >
        <SelectTrigger className="w-full max-h-8 border-neutral-700 py-0 shadow-none lg:w-auto">
          <div className="flex items-center pr-2">
            <ListChecksIcon className="mr-2 size-4 shrink-0 text-neutral-400" />
            <SelectValue placeholder="Всі статуси" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Всі статуси</SelectItem>
          <SelectSeparator />
          {taskStatusesOrdered.map((s) => (
            <SelectItem key={s} value={s}>
              {taskStatusLabelsUk[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        defaultValue={assigneeId ?? undefined}
        onValueChange={(value) => onAssigneeChange(value)}
      >
        <SelectTrigger className="w-full max-h-8 border-neutral-700 py-0 shadow-none lg:w-auto">
          <div className="flex items-center pr-2">
            <UserIcon className="mr-2 size-4 shrink-0 text-neutral-400" />
            <SelectValue placeholder="Всі виконавці" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Всі виконавці</SelectItem>
          <SelectSeparator />
          {memberOptions?.map((member) => (
            <SelectItem key={member.value} value={member.value}>
              {member.label}{" "}
              {member.email === user.email && (
                <span className="text-muted-foreground text-xs">(Ви)</span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!hideProjectFilter && (
        <Select
          defaultValue={projectId ?? undefined}
          onValueChange={(value) => onProjectChange(value)}
        >
          <SelectTrigger className="w-full max-h-8 border-neutral-700 py-0 shadow-none lg:w-auto">
            <div className="flex items-center pr-2">
              <FolderIcon className="mr-2 size-4 shrink-0 text-neutral-400" />
              <SelectValue placeholder="Всі проєкти" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всі проєкти</SelectItem>
            <SelectSeparator />
            {projectOptions?.map((project) => (
              <SelectItem key={project.value} value={project.value}>
                {project.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <DatePicker
        density="filter"
        placeholder="Термін виконання"
        className="h-8 max-h-8 w-full border-neutral-700 py-0 shadow-none lg:w-auto"
        value={dueDate ? new Date(dueDate) : undefined}
        onChange={(date) => {
          setFilters({ dueDate: date ? date.toISOString() : null });
        }}
      />
      <TaskTagFilter />
    </div>
  );
};
