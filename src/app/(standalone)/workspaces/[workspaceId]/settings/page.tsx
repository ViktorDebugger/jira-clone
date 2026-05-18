import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";
import { fetchWorkspaceName, pageMetadata } from "@/lib/site-metadata";
import { WorkspaceIdSettingsClient } from "./client";

interface WorkspaceIdSettingsPageProps {
  params: Promise<{ workspaceId: string }>;
}

export async function generateMetadata({
  params,
}: WorkspaceIdSettingsPageProps): Promise<Metadata> {
  const { workspaceId } = await params;
  const name = await fetchWorkspaceName(workspaceId);
  const title = name ? `Налаштування — ${name}` : "Налаштування робочого простору";
  return pageMetadata(
    title,
    "Змініть назву, зображення та параметри робочого простору FlowForge.",
  );
}

const WorkspaceIdSettingsPage = async (_props: WorkspaceIdSettingsPageProps) => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return <WorkspaceIdSettingsClient />;
};

export default WorkspaceIdSettingsPage;
