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

  async featured(limit: number) {
    return this.catalogRepository.findFeatured(limit);
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
