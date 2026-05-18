import { Models } from "node-appwrite";
import { Project } from "../projects/types";
import { Member } from "../members/types";
import type { Tag } from "../tags/types";

import type { Sprint } from "../sprints/types";

export enum TaskStatus {
  BACKLOG = "BACKLOG",
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  DONE = "DONE",
}

export type Task = Models.Document & {
  name: string;
  status: TaskStatus;
  workspaceId: string;
  assigneeIds: string[];
  projectId: string;
  position: number;
  dueDate: string;
  description: string;
  tagIds?: string[];
  sprintId?: string | null;
};

export type PopulatedTask = Task & {
  project?: Project;
  assignees?: Member[];
  tags?: Tag[];
  sprint?: Sprint | null;
};

export type TasksResponse = {
  documents: PopulatedTask[];
  total: number;
};