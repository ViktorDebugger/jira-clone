import { z } from "zod";

import { TaskStatus } from "./types";

export const createTaskSchema = z.object({
  name: z.string().trim().min(1, "Обов'язково"),
  status: z.enum(TaskStatus, { error: "Обов'язково" }),
  workspaceId: z.string().trim().min(1, "Обов'язково"),
  projectId: z.string().trim().min(1, "Обов'язково"),
  dueDate: z.coerce.date(),
  assigneeIds: z
    .array(z.string().trim().min(1))
    .min(1, "Оберіть принаймні одного виконавця"),
  description: z.string().max(128000).optional(),
  tagIds: z.array(z.string().trim().min(1)).default([]),
  sprintId: z.preprocess((val: unknown) => {
    if (val === "" || val === undefined) return null;
    return val;
  }, z.union([z.string().trim().min(1), z.null()]).optional()),
});
