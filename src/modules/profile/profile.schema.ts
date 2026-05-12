import { z } from "zod";

export const profileUpdateSchema = z.object({
  body: z
    .object({
      fullName: z.string().min(2).max(120).optional(),
    })
    .refine((b) => Object.keys(b).length > 0, "At least one field is required"),
});

export const profileChangePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(128),
  }),
});
