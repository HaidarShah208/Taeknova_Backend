import { StatusCodes } from "http-status-codes";
import { ApiError } from "@common/exceptions/ApiError";
import { CatalogRepository, type CatalogSort } from "@modules/catalog/catalog.repository";
import { CategoryRepository } from "@modules/categories/category.repository";

export class CatalogService {
  constructor(
    private readonly catalogRepository = new CatalogRepository(),
    private readonly categoryRepository = new CategoryRepository(),
  ) {}

  async listProducts(params: {
    page: number;
    limit: number;
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    size?: string;
    color?: string;
    sort?: CatalogSort;
  }) {
    const [items, total] = await this.catalogRepository.findPublicPaginated(params);
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

  /**
   * Returns approved products marked `isFeatured`.
   * If none are featured, falls back to highest base price first so the home "featured" strip
   * does not duplicate the "new arrivals" strip (which uses `sort=newest`).
   */
  async featured(limit: number) {
    const featured = await this.catalogRepository.findFeatured(limit);
    if (featured.length > 0) return featured;
    const [items] = await this.catalogRepository.findPublicPaginated({
      page: 1,
      limit,
      sort: "price_desc",
    });
    return items;
  }

  async getBySlug(slug: string) {
    const product = await this.catalogRepository.findBySlugPublic(slug);
    if (!product) throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");
    return product;
  }

  async related(slug: string, limit: number) {
    const product = await this.catalogRepository.findBySlugPublic(slug);
    if (!product) throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");
    return this.catalogRepository.findRelated(product.id, product.categoryId, limit);
  }

  listPublicCategories() {
    return this.categoryRepository.findPublicActiveForCatalog();
  }

  async productsByCategorySlug(
    slug: string,
    params: {
      page: number;
      limit: number;
      sort?: CatalogSort;
      search?: string;
      size?: string;
      color?: string;
    },
  ) {
    const category = await this.categoryRepository.findBySlug(slug);
    if (!category || !category.isActive) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");
    }
    return this.listProducts({
      ...params,
      categoryId: category.id,
    });
  }
}
