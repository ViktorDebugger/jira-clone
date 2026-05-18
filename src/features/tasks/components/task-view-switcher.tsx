"use client";
import { useCreateTagModal } from "@/features/tags/hooks/use-create-tag-modal";

import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader, PlusIcon, TagIcon } from "lucide-react";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";
import { useGetTasks } from "../api/use-get-tasks";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useQueryState } from "nuqs";
import { DataFilters } from "./data-filters";
import { useTaskFilters } from "../hooks/use-tasks-filters";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { DataKanban } from "./data-kanban";
import { useCallback } from "react";
import { TaskStatus } from "../types";
import { useBulkUpdateTasks } from "../api/use-bulk-update-tasks";
import { DataCalendar } from "./data-calendar";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { AdminOnlyAction } from "@/features/workspaces/components/admin-only-action";

interface TaskViewSwitcherProps {
  hideProjectFilter?: boolean;
}

export const TaskViewSwitcher = ({
  hideProjectFilter,
}: TaskViewSwitcherProps) => {
  const [{ status, assigneeId, projectId, dueDate, tagIds }] = useTaskFilters();

  const [view, setView] = useQueryState("task-view", {
    defaultValue: "table",
  });

  const workspaceId = useWorkspaceId();
  const paramProjectId = useProjectId();

  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({
    workspaceId,
    projectId: paramProjectId || projectId,
    assigneeId,
    status,
    dueDate,
    tagIds,
  });

  const { mutate: bulkUpdate } = useBulkUpdateTasks();

  const onKanbanChange = useCallback(
    (tasks: { $id: string; status: TaskStatus; position: number }[]) => {
      bulkUpdate({
        json: { tasks },
      });
    },
    [bulkUpdate]
  );

  const { open } = useCreateTaskModal();
  const { open: openCreateTagModal } = useCreateTagModal();

  return (
    <Tabs
      defaultValue={view}
      onValueChange={setView}
      className="flex-1 rounded-lg border border-neutral-800 bg-neutral-950"
    >
      <div className="h-full flex flex-col overflow-auto p-4">
        <div className="flex flex-col gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <TabsList className="flex h-auto min-h-9 w-full flex-wrap gap-1 rounded-lg bg-transparent p-[3px] text-neutral-400 sm:flex-nowrap lg:h-9 lg:w-fit lg:max-w-none">
            <TabsTrigger className="h-8 flex-1 sm:flex-none sm:px-3" value="table">
              Таблиця
            </TabsTrigger>
            <TabsTrigger className="h-8 flex-1 sm:flex-none sm:px-3" value="kanban">
              Канбан
            </TabsTrigger>
            <TabsTrigger className="h-8 flex-1 sm:flex-none sm:px-3" value="calendar">
              Календар
            </TabsTrigger>
          </TabsList>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end lg:w-auto lg:flex-nowrap">
            <AdminOnlyAction>
              <Button
                type="button"
                variant="secondary"
                size={"sm"}
                className="w-full justify-center sm:w-auto"
                onClick={() => openCreateTagModal()}
              >
                <TagIcon className="mr-2 size-4 shrink-0" aria-hidden />
                Новий тег
              </Button>
            </AdminOnlyAction>
            <AdminOnlyAction>
              <Button
                size={"sm"}
                className="w-full justify-center sm:w-auto"
                onClick={() => open()}
              >
                <PlusIcon className="mr-2 size-4 shrink-0" aria-hidden />
                Нове завдання
              </Button>
            </AdminOnlyAction>
          </div>
        </div>
        <DottedSeparator className="my-4" />
        <DataFilters hideProjectFilter={hideProjectFilter} />
        <DottedSeparator className="my-4" />
        {isLoadingTasks ? (
          <div className="flex h-[200px] w-full flex-col items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/40">
            <Loader className="size-5 animate-spin text-neutral-400" />
          </div>
        ) : (
          <>
            <TabsContent value="table" className="mt-0">
              <DataTable columns={columns} data={tasks?.documents ?? []} />
            </TabsContent>
            <TabsContent value="kanban" className="mt-0">
              <DataKanban
                onChange={onKanbanChange}
                data={tasks?.documents ?? []}
              />
            </TabsContent>
            <TabsContent value="calendar" className="mt-0 h-full pb-4">
              <DataCalendar data={tasks?.documents ?? []} />
            </TabsContent>
          </>
        )}
      </div>
    </Tabs>
  );
};
