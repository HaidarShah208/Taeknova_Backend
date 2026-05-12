import { Repository } from "typeorm";
import { AppDataSource } from "@database/data-source";
import { Review } from "@modules/reviews/review.entity";

export class ReviewRepository {
  private readonly repo: Repository<Review> = AppDataSource.getRepository(Review);

  create(data: Partial<Review>): Review {
    return this.repo.create(data);
  }

  save(review: Review): Promise<Review> {
    return this.repo.save(review);
  }

  findById(id: string): Promise<Review | null> {
    return this.repo.findOne({ where: { id }, relations: ["user", "product"] });
  }

  findByUserAndProduct(userId: string, productId: string): Promise<Review | null> {
    return this.repo.findOne({ where: { userId, productId } });
  }

  async findByProductIdPaginated(productId: string, page: number, limit: number): Promise<[Review[], number]> {
    return this.repo.findAndCount({
      where: { productId },
      relations: ["user"],
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async remove(review: Review): Promise<void> {
    await this.repo.remove(review);
  }
}
