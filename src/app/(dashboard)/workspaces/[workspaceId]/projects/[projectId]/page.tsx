import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";
import { fetchProjectName, pageMetadata } from "@/lib/site-metadata";

import { ProjectIdClient } from "./client";

interface ProjectIdPageProps {
  params: Promise<{ workspaceId: string; projectId: string }>;
}

export async function generateMetadata({
  params,
}: ProjectIdPageProps): Promise<Metadata> {
  const { projectId } = await params;
  const name = await fetchProjectName(projectId);
  return pageMetadata(
    name ?? "Проєкт",
    name
      ? `Завдання та спринти проєкту «${name}» у FlowForge.`
      : "Керування завданнями проєкту у FlowForge.",
  );
}

const ProjectIdPage = async (_props: ProjectIdPageProps) => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return <ProjectIdClient />;
};

export default ProjectIdPage;
