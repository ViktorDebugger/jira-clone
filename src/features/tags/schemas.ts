import { z } from "zod";

const tagColorSchema = z
  .string()
  .trim()
  .transform((value) => (value.startsWith("#") ? value : `#${value}`))
  .pipe(z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Невірний колір"));

export const createTagSchema = z.object({
  workspaceId: z.string().trim().min(1, "Обов'язково"),
  name: z.string().trim().min(1, "Обов'язково"),
  color: tagColorSchema,
});

export const updateTagSchema = z.object({
  name: z.string().trim().min(1, "Обов'язково"),
  color: tagColorSchema,
});
