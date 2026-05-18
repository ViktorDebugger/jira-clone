"use client";

import { DottedSeparator } from "@/components/dotted-separator";
import { PageLoader } from "@/components/page-loader";
import { TaskBreadcrumbs } from "@/features/tasks/components/task-breadcrumbs";
import { PageError } from "@/components/ui/page-error";
import { useGetTask } from "@/features/tasks/api/use-get-task";
import { useTaskId } from "@/features/tasks/hooks/use-task-id";
import { TaskOverview } from "@/features/tasks/components/task-overview";
import { TaskDescription } from "@/features/tasks/components/task-description";
import { TaskCommentsSection } from "@/features/comments/components/task-comments-section";
import { PopulatedTask } from "@/features/tasks/types";

export const TaskIdClient = () => {
  const taskId = useTaskId();
  const { data, isLoading } = useGetTask({ taskId });

  if (isLoading) {
    return <PageLoader />;
  }

  if (!data) {
    return <PageError message="Завдання не знайдено" />;
  }

  return (
      <div className="flex flex-col">
        <TaskBreadcrumbs project={data.project} task={data} />
        <DottedSeparator className="my-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TaskOverview task={data as PopulatedTask} />
          <TaskDescription task={data} />
        </div>
        <TaskCommentsSection taskId={taskId} />
      </div>
  );
};
