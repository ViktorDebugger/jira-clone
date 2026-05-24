import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";
import { WorkspaceAnalyticsReportClient } from "@/features/workspaces/components/workspace-analytics-report-client";
import { pageMetadata } from "@/lib/site-metadata";
import { PageLoader } from "@/components/page-loader";

export const metadata: Metadata = pageMetadata(
  "PDF-звіт аналітики",
  "Друкований звіт з аналітики робочого простору FlowForge.",
);

const WorkspaceAnalyticsReportPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return (
    <Suspense fallback={<PageLoader />}>
      <WorkspaceAnalyticsReportClient />
    </Suspense>
  );
};

export default WorkspaceAnalyticsReportPage;
