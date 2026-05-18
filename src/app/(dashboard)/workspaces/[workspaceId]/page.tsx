import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";
import { fetchWorkspaceName, pageMetadata } from "@/lib/site-metadata";
import { WorkspaceIdClient } from "./client";

interface WorkspaceIdPageProps {
  params: Promise<{ workspaceId: string }>;
}

export async function generateMetadata({
  params,
}: WorkspaceIdPageProps): Promise<Metadata> {
  const { workspaceId } = await params;
  const name = await fetchWorkspaceName(workspaceId);
  return pageMetadata(
    name ?? "Робочий простір",
    name
      ? `Огляд робочого простору «${name}» у FlowForge.`
      : "Огляд робочого простору у FlowForge.",
  );
}

const WorkspaceIdPage = async (_props: WorkspaceIdPageProps) => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return <WorkspaceIdClient />;
};

export default WorkspaceIdPage;
