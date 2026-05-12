import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from "typeorm";
import { BaseEntity } from "@database/entities/BaseEntity";
import { Product } from "@modules/products/product.entity";
import { User } from "@modules/users/user.entity";

@Entity("reviews")
@Unique(["userId", "productId"])
@Index(["productId"])
export class Review extends BaseEntity {
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

  @Column({ type: "int" })
  rating!: number;

  @Column({ type: "varchar", length: 160, nullable: true })
  title?: string;

  @Column({ type: "text", nullable: true })
  body?: string;
}
