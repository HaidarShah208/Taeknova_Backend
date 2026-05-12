import { z } from "zod";

export const cartAddSchema = z.object({
  body: z.object({
    variantId: z.string().uuid(),
    quantity: z.coerce.number().int().min(1).default(1),
  }),
});

export const cartUpdateQuantitySchema = z.object({
  params: z.object({
    variantId: z.string().uuid(),
  }),
  body: z.object({
    quantity: z.coerce.number().int().min(1),
  }),
});

export const cartVariantParamSchema = z.object({
  params: z.object({
    variantId: z.string().uuid(),
  }),
});
