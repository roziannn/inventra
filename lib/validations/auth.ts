
import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Username or email is required")
    .max(150),

  password: z
    .string()
    .min(1, "Password is required")
    .max(128),
});

export type LoginInput = z.infer<typeof loginSchema>;
