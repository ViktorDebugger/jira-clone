import { Card, CardContent } from "@/components/ui/card";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Loader } from "lucide-react";
import { useParams } from "next/navigation";
import { CreateTaskForm } from "./create-task-form";
import { TaskStatus } from "../types";

interface CreateTaskFormWrapperProps {
  onCancel: () => void;
  status?: TaskStatus | undefined;
}

export const CreateTaskFormWrapper = ({
  onCancel,
  status,
}: CreateTaskFormWrapperProps) => {
  const workspaceId = useWorkspaceId();
  const params = useParams();
  const defaultProjectId =
    typeof params.projectId === "string" ? params.projectId : undefined;

  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({
    workspaceId,
  });

  const projectOptions = projects?.documents.map((project) => ({
    id: project.$id,
    name: project.name,
    imageUrl: project.imageUrl,
  }));

  if (isLoadingProjects) {
    return (
      <Card className="w-full h-[714px] border-none shadow-none">
        <CardContent className="flex items-center justify-center h-full">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <CreateTaskForm
      onCancel={onCancel}
      projectOptions={projectOptions ?? []}
      status={status}
      defaultProjectId={defaultProjectId}
    />
  );
};
