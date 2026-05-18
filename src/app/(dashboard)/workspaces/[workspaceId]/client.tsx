"use client";

import { useMedia } from "react-use";

import { Analytics } from "@/components/analytics";
import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/ui/page-error";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { MemberList } from "@/features/members/components/member-list";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { ProjectList } from "@/features/projects/components/project-list";
import { useGetTasks } from "@/features/tasks/api/use-get-tasks";
import { TaskList } from "@/features/tasks/components/task-list";
import { useGetWorkspaceAnalytics } from "@/features/workspaces/api/use-get-workspace-analytics";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

const DASHBOARD_TASK_PREVIEW_MOBILE = 3;
const DASHBOARD_TASK_PREVIEW_DESKTOP = 8;

export const WorkspaceIdClient = () => {
  const workspaceId = useWorkspaceId();
  const isDesktop = useMedia("(min-width: 1280px)", false);
  const taskPreviewLimit = isDesktop
    ? DASHBOARD_TASK_PREVIEW_DESKTOP
    : DASHBOARD_TASK_PREVIEW_MOBILE;

  const { data: analytics, isLoading: isLoadingAnalytics } =
    useGetWorkspaceAnalytics({ workspaceId });
  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({
    workspaceId,
  });
  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({
    workspaceId,
  });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({
    workspaceId,
  });

  const isLoading =
    isLoadingAnalytics ||
    isLoadingTasks ||
    isLoadingProjects ||
    isLoadingMembers;

  if (isLoading) {
    return <PageLoader />;
  }

  if (!analytics || !tasks || !projects || !members) {
    return <PageError message="Не вдалося завантажити дані робочого простору" />;
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <Analytics data={analytics} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:items-stretch">
        <TaskList
          data={tasks.documents.slice(0, taskPreviewLimit)}
          total={tasks.total}
        />
        <div className="flex flex-col gap-4">
          <ProjectList data={projects.documents} total={projects.total} />
          <MemberList data={members.documents} total={members.total} />
        </div>
      </div>
    </div>
  );
};
