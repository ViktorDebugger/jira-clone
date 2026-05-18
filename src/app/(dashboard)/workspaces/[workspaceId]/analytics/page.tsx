import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";
import { WorkspaceAnalyticsPageClient } from "@/features/workspaces/components/workspace-analytics-page-client";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata = pageMetadata(
  "Аналітика",
  "Статистика завдань, проєктів і активності команди у FlowForge.",
);

const WorkspaceAnalyticsPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return <WorkspaceAnalyticsPageClient />;
};

export default WorkspaceAnalyticsPage;
