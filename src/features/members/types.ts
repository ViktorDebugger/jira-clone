import { Models } from "node-appwrite";

export enum MemberRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

export const memberRoleLabelsUk: Record<MemberRole, string> = {
  [MemberRole.ADMIN]: "Адміністратор",
  [MemberRole.MEMBER]: "Учасник",
};

export type Member = Models.Document & {
  workspaceId: string;
  name: string;
  userId: string;
  role: MemberRole;
  email: string;
};
