import type { Models } from "node-appwrite";

export type Comment = Models.Document & {
  taskId: string;
  workspaceId: string;
  memberId: string;
  body: string;
};

export type PopulatedComment = Comment & {
  authorName: string;
  authorEmail: string;
  isOwner: boolean;
};

export type CommentsListResponse = {
  documents: PopulatedComment[];
  total: number;
};
