import { StatusCodes } from "http-status-codes";
import { ApiError } from "@common/exceptions/ApiError";
import { CatalogRepository } from "@modules/catalog/catalog.repository";
import { ProductRepository } from "@modules/products/product.repository";
import { ProductStatus } from "@modules/products/product.types";
import { ReviewRepository } from "@modules/reviews/review.repository";

export class ReviewService {
  constructor(
    private readonly reviewRepository = new ReviewRepository(),
    private readonly catalogRepository = new CatalogRepository(),
    private readonly productRepository = new ProductRepository(),
  ) {}

  async listPublicByProductSlug(slug: string, params: { page: number; limit: number }) {
    const product = await this.catalogRepository.findBySlugPublic(slug);
    if (!product) throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");
    const [items, total] = await this.reviewRepository.findByProductIdPaginated(
      product.id,
      params.page,
      params.limit,
    );
    return {
      items,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        pages: Math.ceil(total / params.limit) || 1,
      },
    };
  }

  async create(userId: string, payload: { productId: string; rating: number; title?: string; body?: string }) {
    const p = await this.productRepository.findById(payload.productId);
    if (!p || p.status !== ProductStatus.APPROVED) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid product");
    }
    const existing = await this.reviewRepository.findByUserAndProduct(userId, payload.productId);
    if (existing) throw new ApiError(StatusCodes.CONFLICT, "You already reviewed this product");
    const review = this.reviewRepository.create({
      userId,
      productId: payload.productId,
      rating: payload.rating,
      title: payload.title,
      body: payload.body,
    });
    return this.reviewRepository.save(review);
  }

  async update(userId: string, reviewId: string, payload: Partial<{ rating: number; title?: string; body?: string }>) {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review || review.userId !== userId) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Review not found");
    }
    Object.assign(review, payload);
    return this.reviewRepository.save(review);
  }

  async remove(userId: string, reviewId: string): Promise<void> {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review || review.userId !== userId) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Review not found");
    }
    await this.reviewRepository.remove(review);
  }
}
