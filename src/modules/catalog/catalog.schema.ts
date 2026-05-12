import { z } from "zod";

export const catalogListQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().max(200).optional(),
    categoryId: z.string().uuid().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    size: z.string().min(1).max(30).optional(),
    color: z.string().min(1).max(50).optional(),
    sort: z.enum(["newest", "price_asc", "price_desc", "name_asc"]).optional(),
  }),
});

export const catalogSlugParamSchema = z.object({
  params: z.object({
    slug: z.string().min(1).max(200),
  }),
});

export const catalogFeaturedQuerySchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().min(1).max(50).default(12),
  }),
});

export const catalogRelatedQuerySchema = z.object({
  params: z.object({
    slug: z.string().min(1).max(200),
  }),
  query: z.object({
    limit: z.coerce.number().int().min(1).max(24).default(8),
  }),
});

export const catalogCategorySlugQuerySchema = z.object({
  params: z.object({
    slug: z.string().min(1).max(160),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().max(200).optional(),
    sort: z.enum(["newest", "price_asc", "price_desc", "name_asc"]).optional(),
    size: z.string().min(1).max(30).optional(),
    color: z.string().min(1).max(50).optional(),
  }),
});

export const catalogProductReviewsQuerySchema = z.object({
  params: z.object({
    slug: z.string().min(1).max(200),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
});
