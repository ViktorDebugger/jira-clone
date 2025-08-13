import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";

const WorkspaceIdSettingsPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return <WorkspaceIdSettingsPage />;
};

export default WorkspaceIdSettingsPage;
