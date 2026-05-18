import { Models } from "node-appwrite";

export type Tag = Models.Document & {
  name: string;
  color: string;
  workspaceId: string;
};
