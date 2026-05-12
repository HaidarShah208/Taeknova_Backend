import { StatusCodes } from "http-status-codes";
import { ApiError } from "@common/exceptions/ApiError";
import { ProductRepository } from "@modules/products/product.repository";
import { ProductStatus } from "@modules/products/product.types";
import { WishlistRepository } from "@modules/wishlist/wishlist.repository";

export class WishlistService {
  constructor(
    private readonly wishlistRepository = new WishlistRepository(),
    private readonly productRepository = new ProductRepository(),
  ) {}

  list(userId: string) {
    return this.wishlistRepository.findByUserWithProduct(userId);
  }

  async add(userId: string, productId: string) {
    const product = await this.productRepository.findById(productId);
    if (!product || product.status !== ProductStatus.APPROVED) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Product is not available");
    }
    const existing = await this.wishlistRepository.findByUserAndProduct(userId, productId);
    if (existing) return existing;
    const row = this.wishlistRepository.create({ userId, productId });
    return this.wishlistRepository.save(row);
  }

  async remove(userId: string, productId: string): Promise<void> {
    const row = await this.wishlistRepository.findByUserAndProduct(userId, productId);
    if (!row) throw new ApiError(StatusCodes.NOT_FOUND, "Wishlist item not found");
    await this.wishlistRepository.deleteById(row.id);
  }
}
