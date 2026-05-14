import { z } from "zod";

export const verifyEmailQuerySchema = z.object({
  query: z.object({
    token: z.string().min(32).max(128),
  }),
});
