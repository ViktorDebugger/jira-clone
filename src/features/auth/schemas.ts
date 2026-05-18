import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Невірний формат електронної пошти"),
  password: z.string().min(1, "Обов'язково"),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Обов'язково"),
  email: z.string().email("Невірний формат електронної пошти"),
  password: z.string().min(8, "Мінімум 8 символів"),
});
