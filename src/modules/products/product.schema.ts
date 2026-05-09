import { z } from "zod";
import { ProductStatus } from "@modules/products/product.types";

const variantSchema = z.object({
  size: z.string().min(1).max(30),
  color: z.string().min(1).max(50),
  sku: z.string().min(2).max(120),
  stockQuantity: z.number().int().min(0),
  variantPrice: z.number().min(0).optional(),
});

export const productIdParamSchema = z.object({
  params: z.object({
    productId: z.string().uuid(),
  }),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(180),
    slug: z.string().min(2).max(200),
    description: z.string().max(2500).optional(),
    basePrice: z.number().min(0),
    categoryId: z.string().uuid(),
    isFeatured: z.boolean().optional(),
    variants: z.array(variantSchema).min(1),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    productId: z.string().uuid(),
  }),
  body: z
    .object({
      name: z.string().min(2).max(180).optional(),
      slug: z.string().min(2).max(200).optional(),
      description: z.string().max(2500).optional(),
      basePrice: z.number().min(0).optional(),
      categoryId: z.string().uuid().optional(),
      isFeatured: z.boolean().optional(),
      status: z.nativeEnum(ProductStatus).optional(),
    })
    .refine((value) => Object.keys(value).length > 0, "At least one field is required"),
});

export const listProductQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
    status: z.nativeEnum(ProductStatus).optional(),
  }),
});
