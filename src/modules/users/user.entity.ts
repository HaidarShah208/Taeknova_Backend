import { Column, Entity, Index, OneToMany } from "typeorm";
import { UserRole } from "@common/constants/roles";
import { BaseEntity } from "@database/entities/BaseEntity";
import { Product } from "@modules/products/product.entity";

@Entity("users")
export class User extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: "varchar", length: 120 })
  email!: string;

  @Column({ type: "varchar", length: 120 })
  fullName!: string;

  @Column({ type: "varchar", length: 255, select: false })
  passwordHash!: string;

  @Column({ type: "enum", enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @OneToMany(() => Product, (product) => product.createdBy)
  products!: Product[];
}
