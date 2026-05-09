import { z } from "zod";

export const categoryIdParamSchema = z.object({
  params: z.object({
    categoryId: z.string().uuid(),
  }),
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    slug: z.string().min(2).max(160),
    description: z.string().max(1000).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    categoryId: z.string().uuid(),
  }),
  body: z
    .object({
      name: z.string().min(2).max(120).optional(),
      slug: z.string().min(2).max(160).optional(),
      description: z.string().max(1000).optional(),
      isActive: z.boolean().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, "At least one field is required"),
});
