import { z } from "zod";

export const wishlistAddSchema = z.object({
  body: z.object({
    productId: z.string().uuid(),
  }),
});

export const wishlistProductParamSchema = z.object({
  params: z.object({
    productId: z.string().uuid(),
  }),
});
