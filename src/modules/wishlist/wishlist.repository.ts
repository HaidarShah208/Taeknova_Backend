import { Repository } from "typeorm";
import { AppDataSource } from "@database/data-source";
import { WishlistItem } from "@modules/wishlist/wishlistItem.entity";

export class WishlistRepository {
  private readonly repo: Repository<WishlistItem> = AppDataSource.getRepository(WishlistItem);

  create(data: Partial<WishlistItem>): WishlistItem {
    return this.repo.create(data);
  }

  save(item: WishlistItem): Promise<WishlistItem> {
    return this.repo.save(item);
  }

  findByUserWithProduct(userId: string): Promise<WishlistItem[]> {
    return this.repo.find({
      where: { userId },
      relations: ["product", "product.category"],
      order: { createdAt: "DESC" },
    });
  }

  findByUserAndProduct(userId: string, productId: string): Promise<WishlistItem | null> {
    return this.repo.findOne({ where: { userId, productId } });
  }

  async deleteById(id: string): Promise<void> {
    await this.repo.delete({ id });
  }
}
