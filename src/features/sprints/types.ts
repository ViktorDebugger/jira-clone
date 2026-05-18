import { Models } from "node-appwrite";

export type Sprint = Models.Document & {
  name: string;
  workspaceId: string;
  projectId: string;
  startDate: string;
  endDate: string;
};
