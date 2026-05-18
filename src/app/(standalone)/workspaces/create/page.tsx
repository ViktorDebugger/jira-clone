import { CreateWorkspaceForm } from "@/features/workspaces/components/create-workspace-form";
import { getCurrent } from "@/features/auth/queries";
import { pageMetadata } from "@/lib/site-metadata";
import { redirect } from "next/navigation";

export const metadata = pageMetadata(
  "Створити робочий простір",
  "Створіть новий робочий простір FlowForge для вашої команди.",
);

const WorkspaceCreatePage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return (
    <div className="w-full lg:max-w-xl">
      <CreateWorkspaceForm />
    </div>
  );
};

export default WorkspaceCreatePage;
