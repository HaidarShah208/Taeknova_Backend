import { z } from "zod";

export const reviewCreateSchema = z.object({
  body: z.object({
    productId: z.string().uuid(),
    rating: z.coerce.number().int().min(1).max(5),
    title: z.string().max(160).optional(),
    body: z.string().max(5000).optional(),
  }),
});

export const reviewUpdateSchema = z.object({
  params: z.object({
    reviewId: z.string().uuid(),
  }),
  body: z
    .object({
      rating: z.coerce.number().int().min(1).max(5).optional(),
      title: z.string().max(160).optional(),
      body: z.string().max(5000).optional(),
    })
    .refine((b) => Object.keys(b).length > 0, "At least one field is required"),
});

export const reviewIdParamSchema = z.object({
  params: z.object({
    reviewId: z.string().uuid(),
  }),
});
