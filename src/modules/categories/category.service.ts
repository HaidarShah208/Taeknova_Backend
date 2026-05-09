import { StatusCodes } from "http-status-codes";
import { ApiError } from "@common/exceptions/ApiError";
import { CategoryRepository } from "@modules/categories/category.repository";

export class CategoryService {
  constructor(private readonly categoryRepository = new CategoryRepository()) {}

  list() {
    return this.categoryRepository.findAll();
  }

  async create(payload: { name: string; slug: string; description?: string; isActive?: boolean }) {
    const existing = await this.categoryRepository.findBySlug(payload.slug);
    if (existing) throw new ApiError(StatusCodes.CONFLICT, "Category slug already exists");

    const category = this.categoryRepository.create(payload);
    return this.categoryRepository.save(category);
  }

  async update(categoryId: string, payload: Partial<{ name: string; slug: string; description?: string; isActive: boolean }>) {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");

    if (payload.slug && payload.slug !== category.slug) {
      const existingSlug = await this.categoryRepository.findBySlug(payload.slug);
      if (existingSlug) throw new ApiError(StatusCodes.CONFLICT, "Category slug already exists");
    }

    Object.assign(category, payload);
    return this.categoryRepository.save(category);
  }

  async remove(categoryId: string) {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");
    await this.categoryRepository.deleteById(categoryId);
  }
}
