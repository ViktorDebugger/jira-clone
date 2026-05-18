import z from "zod";

import { plainTextLengthFromHtml } from "@/lib/rich-text-plain";

const richBodySchema = z
  .string()
  .max(64000)
  .superRefine((val, ctx) => {
    if (plainTextLengthFromHtml(val) < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Обов'язково",
      });
    }
  });

export const createCommentSchema = z.object({
  taskId: z.string().trim().min(1),
  body: richBodySchema,
});

export const updateCommentSchema = z.object({
  body: richBodySchema,
});
