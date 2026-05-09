import { Column, Entity, Index, OneToMany } from "typeorm";
import { BaseEntity } from "@database/entities/BaseEntity";
import { Product } from "@modules/products/product.entity";

@Entity("categories")
export class Category extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: "varchar", length: 120 })
  name!: string;

  @Column({ type: "varchar", length: 160, unique: true })
  slug!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @OneToMany(() => Product, (product) => product.category)
  products!: Product[];
}
