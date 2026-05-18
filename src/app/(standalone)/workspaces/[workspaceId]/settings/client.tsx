"use client";

import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/ui/page-error";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { EditWorkspaceForm } from "@/features/workspaces/components/edit-workspace-form";
import { WorkspaceTagsSection } from "@/features/tags/components/workspace-tags-section";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

export const WorkspaceIdSettingsClient = () => {
  const workspaceId = useWorkspaceId();
  const { data: initialValues, isLoading } = useGetWorkspace({ workspaceId });

  if (isLoading) {
    return <PageLoader />;
  }

  if (!initialValues) {
    return <PageError message="Робочий простір не знайдено" />;
  }

  return (
    <div className="w-full lg:max-w-3xl flex flex-col gap-8">
      <EditWorkspaceForm initialValues={initialValues} />
      <WorkspaceTagsSection />
    </div>
  );
};
