import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "@common/helpers/apiResponse";
import { CatalogService } from "@modules/catalog/catalog.service";
import { ReviewService } from "@modules/reviews/review.service";

export class CatalogController {
  constructor(
    private readonly catalogService = new CatalogService(),
    private readonly reviewService = new ReviewService(),
  ) {}

  listProducts = async (req: Request, res: Response): Promise<void> => {
    const q = req.query as Record<string, string | undefined>;
    const data = await this.catalogService.listProducts({
      page: Number(q.page) || 1,
      limit: Number(q.limit) || 20,
      search: q.search,
      categoryId: q.categoryId,
      minPrice: q.minPrice !== undefined ? Number(q.minPrice) : undefined,
      maxPrice: q.maxPrice !== undefined ? Number(q.maxPrice) : undefined,
      sort: q.sort as "newest" | "price_asc" | "price_desc" | "name_asc" | undefined,
    });
    sendResponse(res, StatusCodes.OK, "Products retrieved", data);
  };

  featured = async (req: Request, res: Response): Promise<void> => {
    const limit = Number((req.query as { limit?: string }).limit) || 12;
    const data = await this.catalogService.featured(limit);
    sendResponse(res, StatusCodes.OK, "Featured products retrieved", data);
  };

  getBySlug = async (req: Request, res: Response): Promise<void> => {
    const data = await this.catalogService.getBySlug(String(req.params.slug));
    sendResponse(res, StatusCodes.OK, "Product retrieved", data);
  };

  related = async (req: Request, res: Response): Promise<void> => {
    const limit = Number((req.query as { limit?: string }).limit) || 8;
    const data = await this.catalogService.related(String(req.params.slug), limit);
    sendResponse(res, StatusCodes.OK, "Related products retrieved", data);
  };

  listCategories = async (_req: Request, res: Response): Promise<void> => {
    const data = await this.catalogService.listPublicCategories();
    sendResponse(res, StatusCodes.OK, "Categories retrieved", data);
  };

  productsByCategorySlug = async (req: Request, res: Response): Promise<void> => {
    const q = req.query as Record<string, string | undefined>;
    const data = await this.catalogService.productsByCategorySlug(String(req.params.slug), {
      page: Number(q.page) || 1,
      limit: Number(q.limit) || 20,
      sort: q.sort as "newest" | "price_asc" | "price_desc" | "name_asc" | undefined,
      search: q.search,
    });
    sendResponse(res, StatusCodes.OK, "Products retrieved", data);
  };

  productReviews = async (req: Request, res: Response): Promise<void> => {
    const q = req.query as { page?: string; limit?: string };
    const data = await this.reviewService.listPublicByProductSlug(String(req.params.slug), {
      page: Number(q.page) || 1,
      limit: Number(q.limit) || 10,
    });
    sendResponse(res, StatusCodes.OK, "Reviews retrieved", data);
  };
}
