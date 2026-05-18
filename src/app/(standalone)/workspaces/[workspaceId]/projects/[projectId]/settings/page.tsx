import type { Metadata } from "next";
import { getCurrent } from "@/features/auth/queries";
import { fetchProjectName, pageMetadata } from "@/lib/site-metadata";
import { redirect } from "next/navigation";
import { ProjectIdSettingsClient } from "./client";

interface ProjectIdSettingsPageProps {
  params: Promise<{ workspaceId: string; projectId: string }>;
}

export async function generateMetadata({
  params,
}: ProjectIdSettingsPageProps): Promise<Metadata> {
  const { projectId } = await params;
  const name = await fetchProjectName(projectId);
  const title = name ? `Налаштування проєкту — ${name}` : "Налаштування проєкту";
  return pageMetadata(
    title,
    "Редагуйте назву, зображення та параметри проєкту у FlowForge.",
  );
}

const ProjectIdSettingsPage = async (_props: ProjectIdSettingsPageProps) => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return <ProjectIdSettingsClient />;
};

export default ProjectIdSettingsPage;
