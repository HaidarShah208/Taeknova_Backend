import { z } from "zod";

export const updateStockSchema = z.object({
  body: z.object({
    variantId: z.string().uuid(),
    newQuantity: z.number().int().min(0),
    reason: z.string().max(255).optional(),
  }),
});

export const inventoryProductParamSchema = z.object({
  params: z.object({
    productId: z.string().uuid(),
  }),
});
