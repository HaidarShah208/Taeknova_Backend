import { Repository } from "typeorm";
import { AppDataSource } from "@database/data-source";
import { Category } from "@modules/categories/category.entity";
import { ProductStatus } from "@modules/products/product.types";

export type PublicCategoryListRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  productCount: number;
  coverImageUrl: string | null;
};

export class CategoryRepository {
  private readonly repo: Repository<Category> = AppDataSource.getRepository(Category);

  create(data: Partial<Category>): Category {
    return this.repo.create(data);
  }

  save(category: Category): Promise<Category> {
    return this.repo.save(category);
  }

  findAll(): Promise<Category[]> {
    return this.repo.find({ order: { createdAt: "DESC" } });
  }

  findById(id: string): Promise<Category | null> {
    return this.repo.findOne({ where: { id } });
  }

  findBySlug(slug: string): Promise<Category | null> {
    return this.repo.findOne({ where: { slug } });
  }

  findPublicActive(): Promise<Category[]> {
    return this.repo.find({
      where: { isActive: true },
      order: { name: "ASC" },
    });
  }

  /**
   * Active categories with approved product counts and a cover image from the latest product that has images.
   */
  async findPublicActiveForCatalog(): Promise<PublicCategoryListRow[]> {
    const rows: Array<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
      productCount: string | number;
      coverImageUrl: string | null;
    }> = await this.repo.query(
      `
      SELECT c.id, c.name, c.slug, c.description, c."isActive", c."createdAt", c."updatedAt",
        COALESCE(
          (SELECT COUNT(*)::int FROM products p WHERE p."categoryId" = c.id AND p.status = $1),
          0
        ) AS "productCount",
        (
          SELECT p2."imageUrls"[1]
          FROM products p2
          WHERE p2."categoryId" = c.id AND p2.status = $1
            AND cardinality(p2."imageUrls") > 0
            AND COALESCE(p2."imageUrls"[1], '') <> ''
          ORDER BY p2."createdAt" DESC
          LIMIT 1
        ) AS "coverImageUrl"
      FROM categories c
      WHERE c."isActive" = true
      ORDER BY c.name ASC
      `,
      [ProductStatus.APPROVED],
    );
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      isActive: r.isActive,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      productCount: Number(r.productCount) || 0,
      coverImageUrl: r.coverImageUrl,
    }));
  }

  deleteById(id: string): Promise<void> {
    return this.repo.delete({ id }).then(() => undefined);
  }
}
