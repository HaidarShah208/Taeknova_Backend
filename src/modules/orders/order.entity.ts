import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "@database/entities/BaseEntity";
import { OrderItem } from "@modules/orders/orderItem.entity";
import { OrderStatus, PaymentStatus } from "@modules/orders/order.types";
import { User } from "@modules/users/user.entity";

@Entity("orders")
@Index(["userId", "status"])
export class Order extends BaseEntity {
  @Column({ type: "uuid" })
  userId!: string;

  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "enum", enum: OrderStatus, default: OrderStatus.PENDING })
  status!: OrderStatus;

  @Column({ type: "enum", enum: PaymentStatus, default: PaymentStatus.AWAITING })
  paymentStatus!: PaymentStatus;

  @Column({ type: "varchar", length: 40, nullable: true })
  paymentMethod?: string | null;

  @Column({ type: "text", nullable: true })
  paymentProofUrl?: string | null;

  @Column({ type: "numeric", precision: 12, scale: 2, default: "0" })
  codFeeAmount!: string;

  @Column({ type: "jsonb" })
  shippingAddressSnapshot!: Record<string, unknown>;

  @Column({ type: "varchar", length: 80, default: "USD" })
  currency!: string;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  subtotalAmount!: string;

  @Column({ type: "numeric", precision: 12, scale: 2, default: "0" })
  shippingAmount!: string;

  @Column({ type: "numeric", precision: 12, scale: 2, default: "0" })
  taxAmount!: string;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  totalAmount!: string;

  @Column({ type: "varchar", length: 120, nullable: true })
  shippingMethod?: string;

  @Column({ type: "text", nullable: true })
  customerNotes?: string;

  /** Human-facing id for invoices / support (set at order creation). */
  @Column({ type: "varchar", length: 32, nullable: true, unique: true })
  reference?: string | null;

  @OneToMany(() => OrderItem, (line) => line.order, { cascade: true })
  items!: OrderItem[];
}
