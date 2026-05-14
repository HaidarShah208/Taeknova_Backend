import { Column, Entity, Index, OneToMany } from "typeorm";
import { UserRole } from "@common/constants/roles";
import { BaseEntity } from "@database/entities/BaseEntity";
import { Address } from "@modules/addresses/address.entity";
import { CartItem } from "@modules/cart/cartItem.entity";
import { Order } from "@modules/orders/order.entity";
import { Product } from "@modules/products/product.entity";
import { Review } from "@modules/reviews/review.entity";
import { WishlistItem } from "@modules/wishlist/wishlistItem.entity";

@Entity("users")
export class User extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: "varchar", length: 120 })
  email!: string;

  @Column({ type: "varchar", length: 120 })
  fullName!: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  avatarUrl?: string;

  @Column({ type: "varchar", length: 255, select: false })
  passwordHash!: string;

  @Column({ type: "enum", enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  /** When set, the user may sign in (email link confirmed or legacy auto-verified). */
  @Column({ type: "timestamptz", nullable: true })
  emailVerifiedAt!: Date | null;

  @Column({ type: "varchar", length: 64, nullable: true })
  emailVerificationToken!: string | null;

  @Column({ type: "timestamptz", nullable: true })
  emailVerificationExpiresAt!: Date | null;

  @Column({ type: "varchar", length: 64, nullable: true })
  passwordResetToken!: string | null;

  @Column({ type: "timestamptz", nullable: true })
  passwordResetExpiresAt!: Date | null;

  @OneToMany(() => Product, (product) => product.createdBy)
  products!: Product[];

  @OneToMany(() => CartItem, (item) => item.user)
  cartItems!: CartItem[];

  @OneToMany(() => WishlistItem, (item) => item.user)
  wishlistItems!: WishlistItem[];

  @OneToMany(() => Order, (order) => order.user)
  orders!: Order[];

  @OneToMany(() => Address, (addr) => addr.user)
  addresses!: Address[];

  @OneToMany(() => Review, (review) => review.user)
  reviews!: Review[];
}
