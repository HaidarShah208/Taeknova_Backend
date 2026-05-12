import { Repository } from "typeorm";
import { AppDataSource } from "@database/data-source";
import { CartItem } from "@modules/cart/cartItem.entity";

export class CartRepository {
  private readonly repo: Repository<CartItem> = AppDataSource.getRepository(CartItem);

  create(data: Partial<CartItem>): CartItem {
    return this.repo.create(data);
  }

  save(item: CartItem): Promise<CartItem> {
    return this.repo.save(item);
  }

  async findByUserWithVariants(userId: string): Promise<CartItem[]> {
    return this.repo.find({
      where: { userId },
      relations: ["variant", "variant.product"],
      order: { createdAt: "ASC" },
    });
  }

  findByUserAndVariant(userId: string, variantId: string): Promise<CartItem | null> {
    return this.repo.findOne({ where: { userId, variantId }, relations: ["variant", "variant.product"] });
  }

  async deleteById(id: string): Promise<void> {
    await this.repo.delete({ id });
  }

  async clearUserCart(userId: string): Promise<void> {
    await this.repo.delete({ userId });
  }
}
