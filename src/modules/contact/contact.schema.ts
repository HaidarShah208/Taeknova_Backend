import { z } from "zod";

export const contactFormBodySchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(120),
    phone: z.string().trim().max(30).optional(),
    subject: z.string().trim().min(3).max(200),
    message: z.string().trim().min(10).max(5000),
  }),
});
