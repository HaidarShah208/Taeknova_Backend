import { AppDataSource } from "@database/data-source";
import { Address } from "@modules/addresses/address.entity";
import { CartItem } from "@modules/cart/cartItem.entity";
import { Order } from "@modules/orders/order.entity";
import { OrderItem } from "@modules/orders/orderItem.entity";
import { OrderStatus, PaymentStatus, CheckoutPaymentMethod } from "@modules/orders/order.types";
import { OrderRepository } from "@modules/orders/order.repository";
import { ProductStatus } from "@modules/products/product.types";
import { Product } from "@modules/products/product.entity";
import { ProductVariant } from "@modules/products/productVariant.entity";
import { UploadService } from "@modules/uploads/upload.service";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "@common/exceptions/ApiError";
import { EmailService } from "@common/services/email.service";

const FREE_SHIPPING_THRESHOLD = 150;
const STANDARD_SHIPPING = 9.99;
const COD_FEE_PKR = 100;

function computeShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
}

function addressSnapshot(addr: Address): Record<string, unknown> {
  return {
    label: addr.label,
    recipientName: addr.recipientName,
    phone: addr.phone,
    line1: addr.line1,
    line2: addr.line2,
    city: addr.city,
    state: addr.state,
    postalCode: addr.postalCode,
    country: addr.country,
  };
}

export class OrdersService {
  constructor(
    private readonly orderRepository = new OrderRepository(),
    private readonly uploadService = new UploadService(),
    private readonly emailService = new EmailService(),
  ) {}

  async uploadPaymentProofImage(fileBuffer: Buffer): Promise<{ url: string }> {
    const uploaded = await this.uploadService.uploadPaymentProof(fileBuffer);
    return { url: uploaded.secure_url };
  }

  async listMine(userId: string, page: number, limit: number) {
    const [items, total] = await this.orderRepository.findByUserPaginated(userId, page, limit);
    return {
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    };
  }

  async listAllForAdmin(page: number, limit: number) {
    const [items, total] = await this.orderRepository.findAllPaginated(page, limit);
    return {
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    };
  }

  async getMine(userId: string, orderId: string) {
    const order = await this.orderRepository.findByIdAndUser(orderId, userId);
    if (!order) throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
    return order;
  }

  async cancelMine(userId: string, orderId: string): Promise<void> {
    const order = await this.orderRepository.findByIdWithItems(orderId);
    if (!order || order.userId !== userId) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
    }
    if (order.status === OrderStatus.CANCELLED) return;
    if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Order cannot be cancelled");
    }
    await this.releaseOrderStockAndCancel(order);
  }

  /** Restore variant stock and mark order cancelled (used by customer cancel + admin reject). */
  private async releaseOrderStockAndCancel(order: Order): Promise<void> {
    await AppDataSource.transaction(async (manager) => {
      const variantRepo = manager.getRepository(ProductVariant);
      for (const line of order.items ?? []) {
        const v = await variantRepo.findOne({ where: { id: line.variantId } });
        if (v) {
          v.stockQuantity += line.quantity;
          await variantRepo.save(v);
        }
      }
      order.status = OrderStatus.CANCELLED;
      await manager.getRepository(Order).save(order);
    });
  }

  async approveByAdmin(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findByIdWithItems(orderId);
    if (!order) throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
    if (order.status !== OrderStatus.PENDING) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Only pending orders can be accepted");
    }
    order.status = OrderStatus.CONFIRMED;
    return this.orderRepository.save(order);
  }

  async rejectByAdmin(orderId: string): Promise<void> {
    const order = await this.orderRepository.findByIdWithItems(orderId);
    if (!order) throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
    if (order.status !== OrderStatus.PENDING) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Only pending orders can be rejected");
    }
    await this.releaseOrderStockAndCancel(order);
  }

  async shipByAdmin(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findByIdWithItems(orderId);
    if (!order) throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
    if (order.status !== OrderStatus.CONFIRMED && order.status !== OrderStatus.PROCESSING) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Order must be confirmed before shipping");
    }
    order.status = OrderStatus.SHIPPED;
    return this.orderRepository.save(order);
  }

  async deliverByAdmin(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findByIdWithItems(orderId);
    if (!order) throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
    if (order.status !== OrderStatus.SHIPPED) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Order must be shipped before marking delivered");
    }
    order.status = OrderStatus.DELIVERED;
    return this.orderRepository.save(order);
  }

  async createFromCart(params: {
    userId: string;
    addressId: string;
    shippingMethod?: string;
    customerNotes?: string;
    paymentMethod: CheckoutPaymentMethod;
    paymentProofUrl?: string | null;
  }): Promise<Order> {
    const order = await AppDataSource.transaction(async (manager) => {
      const allowed = new Set<string>(Object.values(CheckoutPaymentMethod));
      if (!allowed.has(params.paymentMethod)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid payment method");
      }
      if (params.paymentMethod !== CheckoutPaymentMethod.COD && !params.paymentProofUrl?.trim()) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Payment proof is required for this payment method");
      }

      const cartRepo = manager.getRepository(CartItem);
      const variantRepo = manager.getRepository(ProductVariant);
      const productRepo = manager.getRepository(Product);
      const addressRepo = manager.getRepository(Address);
      const orderRepo = manager.getRepository(Order);
      const orderItemRepo = manager.getRepository(OrderItem);

      const address = await addressRepo.findOne({ where: { id: params.addressId, userId: params.userId } });
      if (!address) throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid shipping address");

      const cartRows = await cartRepo.find({
        where: { userId: params.userId },
        relations: ["variant", "variant.product"],
      });
      if (!cartRows.length) throw new ApiError(StatusCodes.BAD_REQUEST, "Cart is empty");

      let subtotal = 0;
      const prepared: Array<{
        variant: ProductVariant;
        productName: string;
        quantity: number;
        unit: number;
        lineTotal: number;
      }> = [];

      for (const row of cartRows) {
        const variant = await variantRepo.findOne({
          where: { id: row.variantId },
          lock: { mode: "pessimistic_write" },
        });
        if (!variant) throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid cart line");
        const product = await productRepo.findOne({ where: { id: variant.productId } });
        if (!product) throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid cart line");
        if (product.status !== ProductStatus.APPROVED) {
          throw new ApiError(StatusCodes.BAD_REQUEST, "A product in your cart is no longer available");
        }
        if (row.quantity < 1 || row.quantity > variant.stockQuantity) {
          throw new ApiError(StatusCodes.BAD_REQUEST, "Insufficient stock for one or more items");
        }
        const unit = Number(variant.variantPrice ?? product.basePrice);
        const lineTotal = unit * row.quantity;
        subtotal += lineTotal;
        prepared.push({
          variant,
          productName: product.name,
          quantity: row.quantity,
          unit,
          lineTotal,
        });
      }

      const shippingAmount = computeShipping(subtotal);
      const taxAmount = 0;
      const codFee = params.paymentMethod === CheckoutPaymentMethod.COD ? COD_FEE_PKR : 0;
      const totalAmount = subtotal + shippingAmount + taxAmount + codFee;

      const order = orderRepo.create({
        userId: params.userId,
        /** Awaiting admin approval before fulfillment (see admin approve / ship flows). */
        status: OrderStatus.PENDING,
        paymentStatus:
          params.paymentMethod === CheckoutPaymentMethod.COD ? PaymentStatus.PAID : PaymentStatus.AWAITING,
        paymentMethod: params.paymentMethod,
        paymentProofUrl:
          params.paymentMethod === CheckoutPaymentMethod.COD ? null : (params.paymentProofUrl ?? null),
        codFeeAmount: codFee.toFixed(2),
        shippingAddressSnapshot: addressSnapshot(address),
        currency: "USD",
        subtotalAmount: subtotal.toFixed(2),
        shippingAmount: shippingAmount.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        shippingMethod: params.shippingMethod,
        customerNotes: params.customerNotes,
      });
      const saved = await orderRepo.save(order);
      saved.reference = `TN-${saved.id.replace(/-/g, "").slice(0, 10).toUpperCase()}`;
      await orderRepo.save(saved);

      for (const line of prepared) {
        await orderItemRepo.save(
          orderItemRepo.create({
            orderId: saved.id,
            variantId: line.variant.id,
            productId: line.variant.productId,
            productName: line.productName,
            sku: line.variant.sku,
            variantLabel: `${line.variant.size} / ${line.variant.color}`,
            quantity: line.quantity,
            unitPrice: line.unit.toFixed(2),
            lineTotal: line.lineTotal.toFixed(2),
          }),
        );
        line.variant.stockQuantity -= line.quantity;
        await variantRepo.save(line.variant);
      }

      await cartRepo.delete({ userId: params.userId });
      const full = await orderRepo.findOne({
        where: { id: saved.id },
        relations: ["items", "items.variant", "user"],
      });
      if (!full) throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Order creation failed");
      return full;
    });

    this.notifyAdminOrderCreatedFireAndForget(order);

    return order;
  }

  /**
   * Sends admin email after the order transaction has committed.
   * Failures are logged only — never fail the API response.
   */
  private notifyAdminOrderCreatedFireAndForget(order: Order): void {
    void this.emailService.sendAdminOrderCreatedNotification(order).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[orders] Admin order notification email failed", {
        orderId: order.id,
        reference: order.reference,
        error: message,
      });
    });
  }
}
