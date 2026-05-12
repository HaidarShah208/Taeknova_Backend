import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "@database/entities/BaseEntity";
import { Order } from "@modules/orders/order.entity";
import { ProductVariant } from "@modules/products/productVariant.entity";

@Entity("order_items")
@Index(["orderId"])
export class OrderItem extends BaseEntity {
  @Column({ type: "uuid" })
  orderId!: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "orderId" })
  order!: Order;

  @Column({ type: "uuid" })
  variantId!: string;

  @ManyToOne(() => ProductVariant, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "variantId" })
  variant!: ProductVariant;

  @Column({ type: "uuid" })
  productId!: string;

  @Column({ type: "varchar", length: 200 })
  productName!: string;

  @Column({ type: "varchar", length: 120 })
  sku!: string;

  @Column({ type: "varchar", length: 80 })
  variantLabel!: string;

  @Column({ type: "int" })
  quantity!: number;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  unitPrice!: string;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  lineTotal!: string;
}
