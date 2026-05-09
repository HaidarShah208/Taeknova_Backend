import { Repository } from "typeorm";
import { AppDataSource } from "@database/data-source";
import { Category } from "@modules/categories/category.entity";

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

  deleteById(id: string): Promise<void> {
    return this.repo.delete({ id }).then(() => undefined);
  }
}
