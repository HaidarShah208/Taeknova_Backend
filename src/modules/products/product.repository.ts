import { Repository } from "typeorm";
import { AppDataSource } from "@database/data-source";
import { Product } from "@modules/products/product.entity";

export class ProductRepository {
  private readonly repo: Repository<Product> = AppDataSource.getRepository(Product);

  create(data: Partial<Product>): Product {
    return this.repo.create(data);
  }

  save(product: Product): Promise<Product> {
    return this.repo.save(product);
  }

  findById(id: string): Promise<Product | null> {
    return this.repo.findOne({ where: { id }, relations: ["variants", "category"] });
  }

  findBySlug(slug: string): Promise<Product | null> {
    return this.repo.findOne({ where: { slug } });
  }

  async findPaginated(options: { page: number; limit: number; search?: string; status?: string }) {
    const { page, limit, search, status } = options;
    const qb = this.repo
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.variants", "variant")
      .leftJoinAndSelect("product.category", "category");

    if (search) qb.andWhere("product.name ILIKE :search", { search: `%${search}%` });
    if (status) qb.andWhere("product.status = :status", { status });

    qb.orderBy("product.createdAt", "DESC").skip((page - 1) * limit).take(limit);

    return qb.getManyAndCount();
  }

  async remove(product: Product): Promise<void> {
    await this.repo.remove(product);
  }
}
