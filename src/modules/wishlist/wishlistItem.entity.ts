import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from "typeorm";
import { BaseEntity } from "@database/entities/BaseEntity";
import { Product } from "@modules/products/product.entity";
import { User } from "@modules/users/user.entity";

@Entity("wishlist_items")
@Unique(["userId", "productId"])
@Index(["userId"])
export class WishlistItem extends BaseEntity {
  @Column({ type: "uuid" })
  userId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "uuid" })
  productId!: string;

  @ManyToOne(() => Product, { onDelete: "CASCADE" })
  @JoinColumn({ name: "productId" })
  product!: Product;
}
