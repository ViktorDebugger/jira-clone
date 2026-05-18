"use client";

import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiAddCircleFill } from "react-icons/ri";
import { AdminOnlyAction } from "@/features/workspaces/components/admin-only-action";

export const Projects = () => {
  const pathname = usePathname();
  const { open } = useCreateProjectModal();
  const workspaceId = useWorkspaceId();
  const { data } = useGetProjects({
    workspaceId,
  });

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between ">
        <p className="text-xs uppercase text-neutral-400">Проєкти</p>
        <AdminOnlyAction>
          <button
            type="button"
            onClick={open}
            className="size-5 text-neutral-400 cursor-pointer transition hover:opacity-75"
            aria-label="Створити проєкт"
          >
            <RiAddCircleFill className="size-5" />
          </button>
        </AdminOnlyAction>
      </div>
      {data?.documents.map((project) => {
        const href = `/workspaces/${workspaceId}/projects/${project.$id}`;
        const isActive = pathname === href;

        return (
          <Link href={href} key={project.$id}>
            <div
              className={cn(
                "flex items-center gap-2.5 p-2.5 rounded-md hover:opacity-75 transition cursor-pointer text-neutral-400",
                isActive && "bg-neutral-900 shadow-sm hover:opacity-100 text-red-500",
              )}
            >
              <ProjectAvatar image={project.imageUrl} name={project.name} />
              <span className="min-w-0 flex-1 truncate">{project.name}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
