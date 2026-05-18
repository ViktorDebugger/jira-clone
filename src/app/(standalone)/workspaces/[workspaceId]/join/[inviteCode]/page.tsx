import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";
import { fetchWorkspaceName, pageMetadata } from "@/lib/site-metadata";
import { WorkspaceIdJoinClient } from "./client";

interface WorkspaceIdJoinPageProps {
  params: Promise<{ workspaceId: string; inviteCode: string }>;
}

export async function generateMetadata({
  params,
}: WorkspaceIdJoinPageProps): Promise<Metadata> {
  const { workspaceId } = await params;
  const name = await fetchWorkspaceName(workspaceId);
  return pageMetadata(
    name ? `Запрошення — ${name}` : "Запрошення до робочого простору",
    "Приєднайтеся до команди в FlowForge за посиланням-запрошенням.",
  );
}

const WorkspaceIdJoinPage = async (_props: WorkspaceIdJoinPageProps) => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return <WorkspaceIdJoinClient />;
};

export default WorkspaceIdJoinPage;
