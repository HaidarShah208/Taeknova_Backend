import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from "typeorm";
import { BaseEntity } from "@database/entities/BaseEntity";
import { ProductVariant } from "@modules/products/productVariant.entity";
import { User } from "@modules/users/user.entity";

@Entity("cart_items")
@Unique(["userId", "variantId"])
@Index(["userId"])
export class CartItem extends BaseEntity {
  @Column({ type: "uuid" })
  userId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "uuid" })
  variantId!: string;

  @ManyToOne(() => ProductVariant, { onDelete: "CASCADE" })
  @JoinColumn({ name: "variantId" })
  variant!: ProductVariant;

  @Column({ type: "int", default: 1 })
  quantity!: number;
}
