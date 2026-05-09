import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "@database/entities/BaseEntity";
import { Category } from "@modules/categories/category.entity";
import { ProductStatus, StockStatus } from "@modules/products/product.types";
import { User } from "@modules/users/user.entity";
import { ProductVariant } from "@modules/products/productVariant.entity";

@Entity("products")
@Index(["name", "status"])
export class Product extends BaseEntity {
  @Column({ type: "varchar", length: 180 })
  name!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 200, unique: true })
  slug!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "numeric", precision: 10, scale: 2 })
  basePrice!: number;

  @Column({ type: "boolean", default: false })
  isFeatured!: boolean;

  @Column({ type: "text", array: true, default: "{}" })
  imageUrls!: string[];

  @Column({ type: "enum", enum: ProductStatus, default: ProductStatus.PENDING })
  status!: ProductStatus;

  @Column({ type: "enum", enum: StockStatus, default: StockStatus.IN_STOCK })
  stockStatus!: StockStatus;

  @Column({ type: "uuid" })
  categoryId!: string;

  @ManyToOne(() => Category, (category) => category.products, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "categoryId" })
  category!: Category;

  @Column({ type: "uuid" })
  createdById!: string;

  @ManyToOne(() => User, (user) => user.products, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "createdById" })
  createdBy!: User;

  @OneToMany(() => ProductVariant, (variant) => variant.product, { cascade: true })
  variants!: ProductVariant[];
}
