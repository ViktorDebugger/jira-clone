import { z } from "zod";

export const createSprintSchema = z
  .object({
    workspaceId: z.string().trim().min(1, "Обов'язково"),
    projectId: z.string().trim().min(1, "Обов'язково"),
    name: z.string().trim().min(1, "Обов'язково"),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .superRefine((data, ctx) => {
    if (data.startDate > data.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Кінець має бути не раніше за початок",
        path: ["endDate"],
      });
    }
  });

export const updateSprintSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.name === undefined &&
      data.startDate === undefined &&
      data.endDate === undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Немає полів для оновлення",
        path: ["name"],
      });
    }
    if (data.startDate !== undefined && data.endDate !== undefined) {
      if (data.startDate > data.endDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Кінець має бути не раніше за початок",
          path: ["endDate"],
        });
      }
    }
  });

export const sprintFieldsSchema = z
  .object({
    name: z.string().trim().min(1, "Обов'язково"),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .superRefine((data, ctx) => {
    if (data.startDate > data.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Кінець має бути не раніше за початок",
        path: ["endDate"],
      });
    }
  });