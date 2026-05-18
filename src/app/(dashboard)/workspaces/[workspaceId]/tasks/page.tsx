import { getCurrent } from "@/features/auth/queries";
import { TaskViewSwitcher } from "@/features/tasks/components/task-view-switcher";
import { pageMetadata } from "@/lib/site-metadata";
import { redirect } from "next/navigation";

export const metadata = pageMetadata(
  "Завдання",
  "Переглядайте та керуйте завданнями команди у FlowForge.",
);

const TasksPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return (
    <div className="h-full flex flex-col">
      <TaskViewSwitcher />
    </div>
  );
};

export default TasksPage;
