import { AppDataSource } from "@database/data-source";
import { Address } from "@modules/addresses/address.entity";
import { CartItem } from "@modules/cart/cartItem.entity";
import { Order } from "@modules/orders/order.entity";
import { OrderItem } from "@modules/orders/orderItem.entity";
import { OrderStatus, PaymentStatus } from "@modules/orders/order.types";
import { OrderRepository } from "@modules/orders/order.repository";
import { ProductStatus } from "@modules/products/product.types";
import { ProductVariant } from "@modules/products/productVariant.entity";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "@common/exceptions/ApiError";

const FREE_SHIPPING_THRESHOLD = 150;
const STANDARD_SHIPPING = 9.99;

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
  constructor(private readonly orderRepository = new OrderRepository()) {}

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

  async createFromCart(params: {
    userId: string;
    addressId: string;
    shippingMethod?: string;
    customerNotes?: string;
  }): Promise<Order> {
    return AppDataSource.transaction(async (manager) => {
      const cartRepo = manager.getRepository(CartItem);
      const variantRepo = manager.getRepository(ProductVariant);
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
        const variant = row.variant;
        if (!variant?.product) throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid cart line");
        if (variant.product.status !== ProductStatus.APPROVED) {
          throw new ApiError(StatusCodes.BAD_REQUEST, "A product in your cart is no longer available");
        }
        if (row.quantity < 1 || row.quantity > variant.stockQuantity) {
          throw new ApiError(StatusCodes.BAD_REQUEST, "Insufficient stock for one or more items");
        }
        const unit = Number(variant.variantPrice ?? variant.product.basePrice);
        const lineTotal = unit * row.quantity;
        subtotal += lineTotal;
        prepared.push({
          variant,
          productName: variant.product.name,
          quantity: row.quantity,
          unit,
          lineTotal,
        });
      }

      const shippingAmount = computeShipping(subtotal);
      const taxAmount = 0;
      const totalAmount = subtotal + shippingAmount + taxAmount;

      const order = orderRepo.create({
        userId: params.userId,
        status: OrderStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PAID,
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
      const full = await orderRepo.findOne({ where: { id: saved.id }, relations: ["items", "items.variant"] });
      if (!full) throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Order creation failed");
      return full;
    });
  }
}
