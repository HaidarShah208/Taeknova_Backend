import { StatusCodes } from "http-status-codes";
import { ApiError } from "@common/exceptions/ApiError";
import { InventoryRepository } from "@modules/inventory/inventory.repository";
import { ProductRepository } from "@modules/products/product.repository";
import { ProductVariantRepository } from "@modules/products/productVariant.repository";
import { StockStatus } from "@modules/products/product.types";

export class InventoryService {
  constructor(
    private readonly inventoryRepository = new InventoryRepository(),
    private readonly productRepository = new ProductRepository(),
    private readonly variantRepository = new ProductVariantRepository(),
  ) {}

  private evaluateStockStatus(totalStock: number): StockStatus {
    if (totalStock <= 0) return StockStatus.OUT_OF_STOCK;
    if (totalStock <= 10) return StockStatus.LOW_STOCK;
    return StockStatus.IN_STOCK;
  }

  async updateStock(payload: { variantId: string; newQuantity: number; reason?: string }) {
    const variant = await this.variantRepository.findById(payload.variantId);
    if (!variant) throw new ApiError(StatusCodes.NOT_FOUND, "Variant not found");

    const previousQuantity = variant.stockQuantity;
    variant.stockQuantity = payload.newQuantity;
    await this.variantRepository.save(variant);

    const variants = await this.variantRepository.findByProduct(variant.productId);
    const totalStock = variants.reduce((sum, item) => sum + item.stockQuantity, 0);

    const product = await this.productRepository.findById(variant.productId);
    if (product) {
      product.stockStatus = this.evaluateStockStatus(totalStock);
      await this.productRepository.save(product);
    }

    const log = this.inventoryRepository.create({
      productId: variant.productId,
      variantId: variant.id,
      previousQuantity,
      newQuantity: payload.newQuantity,
      reason: payload.reason,
    });
    await this.inventoryRepository.save(log);

    return {
      variant,
      totalStock,
      stockStatus: product?.stockStatus,
    };
  }

  listLogs(productId: string) {
    return this.inventoryRepository.listByProduct(productId);
  }
}
