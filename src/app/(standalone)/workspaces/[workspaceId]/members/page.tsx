import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";
import { MembersList } from "@/features/workspaces/components/members-list";
import { fetchWorkspaceName, pageMetadata } from "@/lib/site-metadata";

interface WorkspaceIdMembersPageProps {
  params: Promise<{ workspaceId: string }>;
}

export async function generateMetadata({
  params,
}: WorkspaceIdMembersPageProps): Promise<Metadata> {
  const { workspaceId } = await params;
  const name = await fetchWorkspaceName(workspaceId);
  const title = name ? `Учасники — ${name}` : "Учасники";
  return pageMetadata(
    title,
    "Керуйте учасниками та ролями в робочому просторі FlowForge.",
  );
}

const WorkspaceIdMembersPage = async (_props: WorkspaceIdMembersPageProps) => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return (
    <div className="w-full lg:max-w-xl">
      <MembersList email={user.email} />
    </div>
  );
};

export default WorkspaceIdMembersPage;
