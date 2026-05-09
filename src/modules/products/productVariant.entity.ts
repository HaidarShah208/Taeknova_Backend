import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "@database/entities/BaseEntity";
import { Product } from "@modules/products/product.entity";

@Entity("product_variants")
@Index(["productId", "size", "color"], { unique: true })
export class ProductVariant extends BaseEntity {
  @Column({ type: "uuid" })
  productId!: string;

  @ManyToOne(() => Product, (product) => product.variants, { onDelete: "CASCADE" })
  @JoinColumn({ name: "productId" })
  product!: Product;

  @Column({ type: "varchar", length: 30 })
  size!: string;

  @Column({ type: "varchar", length: 50 })
  color!: string;

  @Column({ type: "varchar", length: 120, unique: true })
  sku!: string;

  @Column({ type: "int", default: 0 })
  stockQuantity!: number;

  @Column({ type: "numeric", precision: 10, scale: 2, nullable: true })
  variantPrice?: number;
}
