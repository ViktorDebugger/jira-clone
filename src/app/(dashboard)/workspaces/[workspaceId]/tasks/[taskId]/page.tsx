import type { Metadata } from "next";
import { getCurrent } from "@/features/auth/queries";
import { fetchTaskName, pageMetadata } from "@/lib/site-metadata";
import { redirect } from "next/navigation";
import { TaskIdClient } from "./client";

interface TaskIdPageProps {
  params: Promise<{ workspaceId: string; taskId: string }>;
}

export async function generateMetadata({
  params,
}: TaskIdPageProps): Promise<Metadata> {
  const { taskId } = await params;
  const name = await fetchTaskName(taskId);
  return pageMetadata(
    name ?? "Завдання",
    name
      ? `Деталі завдання «${name}» у FlowForge.`
      : "Перегляд і редагування завдання у FlowForge.",
  );
}

const TaskIdPage = async (_props: TaskIdPageProps) => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return <TaskIdClient />;
};

export default TaskIdPage;
