import { Repository } from "typeorm";
import { AppDataSource } from "@database/data-source";
import { Product } from "@modules/products/product.entity";
import { ProductStatus } from "@modules/products/product.types";

export type CatalogSort = "newest" | "price_asc" | "price_desc" | "name_asc";

export class CatalogRepository {
  private readonly repo: Repository<Product> = AppDataSource.getRepository(Product);

  private baseApprovedQuery() {
    return this.repo
      .createQueryBuilder("p")
      .leftJoinAndSelect("p.variants", "v")
      .leftJoinAndSelect("p.category", "c")
      .where("p.status = :status", { status: ProductStatus.APPROVED });
  }

  async findPublicPaginated(options: {
    page: number;
    limit: number;
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    size?: string;
    color?: string;
    sort?: CatalogSort;
  }): Promise<[Product[], number]> {
    const qb = this.baseApprovedQuery();
    if (options.search) {
      qb.andWhere("(p.name ILIKE :search OR p.description ILIKE :search)", { search: `%${options.search}%` });
    }
    if (options.categoryId) {
      qb.andWhere("p.categoryId = :categoryId", { categoryId: options.categoryId });
    }
    if (options.minPrice !== undefined) {
      qb.andWhere("p.basePrice >= :minPrice", { minPrice: options.minPrice });
    }
    if (options.maxPrice !== undefined) {
      qb.andWhere("p.basePrice <= :maxPrice", { maxPrice: options.maxPrice });
    }
    if (options.size) {
      qb.andWhere(
        `EXISTS (SELECT 1 FROM product_variants pv_sz WHERE pv_sz."productId" = p.id AND pv_sz.size = :filterSize)`,
        { filterSize: options.size },
      );
    }
    if (options.color) {
      qb.andWhere(
        `EXISTS (SELECT 1 FROM product_variants pv_co WHERE pv_co."productId" = p.id AND pv_co.color = :filterColor)`,
        { filterColor: options.color },
      );
    }
    const sort = options.sort ?? "newest";
    if (sort === "price_asc") qb.orderBy("p.basePrice", "ASC");
    else if (sort === "price_desc") qb.orderBy("p.basePrice", "DESC");
    else if (sort === "name_asc") qb.orderBy("p.name", "ASC");
    else qb.orderBy("p.createdAt", "DESC");

    qb.skip((options.page - 1) * options.limit).take(options.limit);
    return qb.getManyAndCount();
  }

  async findFeatured(limit: number): Promise<Product[]> {
    return this.baseApprovedQuery()
      .andWhere("p.isFeatured = :featured", { featured: true })
      .orderBy("p.createdAt", "DESC")
      .take(limit)
      .getMany();
  }

  findBySlugPublic(slug: string): Promise<Product | null> {
    return this.baseApprovedQuery().andWhere("p.slug = :slug", { slug }).getOne();
  }

  async findRelated(productId: string, categoryId: string, limit: number): Promise<Product[]> {
    return this.baseApprovedQuery()
      .andWhere("p.categoryId = :categoryId", { categoryId })
      .andWhere("p.id != :productId", { productId })
      .orderBy("p.createdAt", "DESC")
      .take(limit)
      .getMany();
  }
}
