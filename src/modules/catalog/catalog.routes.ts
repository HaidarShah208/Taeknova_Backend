import { Router } from "express";
import { asyncHandler } from "@common/utils/asyncHandler";
import { validate } from "@common/middleware/validate";
import { CatalogController } from "@modules/catalog/catalog.controller";
import {
  catalogCategorySlugQuerySchema,
  catalogFeaturedQuerySchema,
  catalogListQuerySchema,
  catalogProductReviewsQuerySchema,
  catalogRelatedQuerySchema,
  catalogSlugParamSchema,
} from "@modules/catalog/catalog.schema";

const catalogController = new CatalogController();
export const catalogRouter = Router();

catalogRouter.get("/categories", asyncHandler(catalogController.listCategories));
catalogRouter.get(
  "/categories/:slug/products",
  validate(catalogCategorySlugQuerySchema),
  asyncHandler(catalogController.productsByCategorySlug),
);

catalogRouter.get("/products", validate(catalogListQuerySchema), asyncHandler(catalogController.listProducts));
catalogRouter.get("/products/featured", validate(catalogFeaturedQuerySchema), asyncHandler(catalogController.featured));
catalogRouter.get("/products/:slug", validate(catalogSlugParamSchema), asyncHandler(catalogController.getBySlug));
catalogRouter.get("/products/:slug/related", validate(catalogRelatedQuerySchema), asyncHandler(catalogController.related));
catalogRouter.get(
  "/products/:slug/reviews",
  validate(catalogProductReviewsQuerySchema),
  asyncHandler(catalogController.productReviews),
);
