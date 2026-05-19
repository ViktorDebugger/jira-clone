import type { Metadata } from "next";

import {
  DATABASE_ID,
  PROJECTS_ID,
  TASKS_ID,
  WORKSPACES_ID,
} from "@/config";
import { createSessionClient } from "@/lib/appwrite";
import { getSiteUrl } from "@/lib/site-url";

export const SITE_NAME = "FlowForge";

export const SITE_DESCRIPTION =
  "FlowForge — платформа для керування завданнями, проєктами та командною роботою в одному робочому просторі.";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
};

export function pageMetadata(
  title: string,
  description?: string,
): Metadata {
  return {
    title,
    description: description ?? SITE_DESCRIPTION,
  };
}

export async function fetchWorkspaceName(
  workspaceId: string,
): Promise<string | null> {
  try {
    const { databases } = await createSessionClient();
    const workspace = await databases.getDocument(
      DATABASE_ID,
      WORKSPACES_ID,
      workspaceId,
    );
    return typeof workspace.name === "string" ? workspace.name : null;
  } catch {
    return null;
  }
}

export async function fetchProjectName(
  projectId: string,
): Promise<string | null> {
  try {
    const { databases } = await createSessionClient();
    const project = await databases.getDocument(
      DATABASE_ID,
      PROJECTS_ID,
      projectId,
    );
    return typeof project.name === "string" ? project.name : null;
  } catch {
    return null;
  }
}

export async function fetchTaskName(taskId: string): Promise<string | null> {
  try {
    const { databases } = await createSessionClient();
    const task = await databases.getDocument(DATABASE_ID, TASKS_ID, taskId);
    return typeof task.name === "string" ? task.name : null;
  } catch {
    return null;
  }
}
