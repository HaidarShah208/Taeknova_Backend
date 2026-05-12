import { StatusCodes } from "http-status-codes";
import { ApiError } from "@common/exceptions/ApiError";
import { CartRepository } from "@modules/cart/cart.repository";
import { Product } from "@modules/products/product.entity";
import { ProductVariant } from "@modules/products/productVariant.entity";
import { ProductVariantRepository } from "@modules/products/productVariant.repository";
import { ProductStatus } from "@modules/products/product.types";

const FREE_SHIPPING_THRESHOLD = 150;
const STANDARD_SHIPPING = 9.99;

export interface CheckoutLineSummary {
  variantId: string;
  productId: string;
  productName: string;
  sku: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CheckoutSummaryResult {
  lines: CheckoutLineSummary[];
  subtotalAmount: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
}

export class CheckoutService {
  constructor(
    private readonly cartRepository = new CartRepository(),
    private readonly variantRepository = new ProductVariantRepository(),
  ) {}

  private computeShipping(subtotal: number): number {
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  }

  private validateLine(variant: ProductVariant & { product: Product }, quantity: number): CheckoutLineSummary {
    if (variant.product.status !== ProductStatus.APPROVED) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "A product in your cart is no longer available");
    }
    if (quantity < 1 || quantity > variant.stockQuantity) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid quantity for one or more items");
    }
    const unit = Number(variant.variantPrice ?? variant.product.basePrice);
    return {
      variantId: variant.id,
      productId: variant.product.id,
      productName: variant.product.name,
      sku: variant.sku,
      variantLabel: `${variant.size} / ${variant.color}`,
      quantity,
      unitPrice: unit,
      lineTotal: unit * quantity,
    };
  }

  async summaryFromLines(lines: { variantId: string; quantity: number }[]): Promise<CheckoutSummaryResult> {
    if (!lines.length) throw new ApiError(StatusCodes.BAD_REQUEST, "Cart is empty");
    const resolved: CheckoutLineSummary[] = [];
    let subtotal = 0;
    for (const line of lines) {
      const variant = await this.variantRepository.findByIdWithProduct(line.variantId);
      if (!variant || !variant.product) throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid variant");
      const row = this.validateLine(variant as ProductVariant & { product: Product }, line.quantity);
      resolved.push(row);
      subtotal += row.lineTotal;
    }
    const shipping = this.computeShipping(subtotal);
    const tax = 0;
    return {
      lines: resolved,
      subtotalAmount: subtotal,
      shippingAmount: shipping,
      taxAmount: tax,
      totalAmount: subtotal + shipping + tax,
      currency: "USD",
    };
  }

  async summaryFromUserCart(userId: string): Promise<CheckoutSummaryResult> {
    const cart = await this.cartRepository.findByUserWithVariants(userId);
    if (!cart.length) throw new ApiError(StatusCodes.BAD_REQUEST, "Cart is empty");
    const lines = cart.map((c) => ({ variantId: c.variantId, quantity: c.quantity }));
    return this.summaryFromLines(lines);
  }
}
