import { StatusCodes } from "http-status-codes";
import { ApiError } from "@common/exceptions/ApiError";
import { CartRepository } from "@modules/cart/cart.repository";
import { ProductVariantRepository } from "@modules/products/productVariant.repository";
import { ProductStatus } from "@modules/products/product.types";

export class CartService {
  constructor(
    private readonly cartRepository = new CartRepository(),
    private readonly variantRepository = new ProductVariantRepository(),
  ) {}

  private assertApprovedVariant(variant: { stockQuantity: number; product: { status: ProductStatus } }) {
    if (variant.product.status !== ProductStatus.APPROVED) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Product is not available");
    }
  }

  async getCart(userId: string) {
    return this.cartRepository.findByUserWithVariants(userId);
  }

  async addItem(userId: string, variantId: string, quantity: number) {
    const variant = await this.variantRepository.findByIdWithProduct(variantId);
    if (!variant) throw new ApiError(StatusCodes.NOT_FOUND, "Variant not found");
    this.assertApprovedVariant(variant);
    if (quantity < 1) throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid quantity");
    if (quantity > variant.stockQuantity) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Insufficient stock");
    }
    const existing = await this.cartRepository.findByUserAndVariant(userId, variantId);
    if (existing) {
      const nextQty = existing.quantity + quantity;
      if (nextQty > variant.stockQuantity) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Insufficient stock");
      }
      existing.quantity = nextQty;
      return this.cartRepository.save(existing);
    }
    const row = this.cartRepository.create({ userId, variantId, quantity });
    return this.cartRepository.save(row);
  }

  async updateQuantity(userId: string, variantId: string, quantity: number) {
    if (quantity < 1) throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid quantity");
    const row = await this.cartRepository.findByUserAndVariant(userId, variantId);
    if (!row) throw new ApiError(StatusCodes.NOT_FOUND, "Cart item not found");
    const variant = await this.variantRepository.findByIdWithProduct(variantId);
    if (!variant) throw new ApiError(StatusCodes.NOT_FOUND, "Variant not found");
    this.assertApprovedVariant(variant);
    if (quantity > variant.stockQuantity) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Insufficient stock");
    }
    row.quantity = quantity;
    return this.cartRepository.save(row);
  }

  async removeItem(userId: string, variantId: string): Promise<void> {
    const row = await this.cartRepository.findByUserAndVariant(userId, variantId);
    if (!row) throw new ApiError(StatusCodes.NOT_FOUND, "Cart item not found");
    await this.cartRepository.deleteById(row.id);
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartRepository.clearUserCart(userId);
  }
}
