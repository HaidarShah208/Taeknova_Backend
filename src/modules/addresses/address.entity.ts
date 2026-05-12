import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "@database/entities/BaseEntity";
import { User } from "@modules/users/user.entity";

@Entity("addresses")
@Index(["userId", "isDefault"])
export class Address extends BaseEntity {
  @Column({ type: "uuid" })
  userId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "varchar", length: 80 })
  label!: string;

  @Column({ type: "varchar", length: 120 })
  recipientName!: string;

  @Column({ type: "varchar", length: 40, nullable: true })
  phone?: string;

  @Column({ type: "varchar", length: 180 })
  line1!: string;

  @Column({ type: "varchar", length: 180, nullable: true })
  line2?: string;

  @Column({ type: "varchar", length: 100 })
  city!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  state?: string;

  @Column({ type: "varchar", length: 24 })
  postalCode!: string;

  @Column({ type: "varchar", length: 80 })
  country!: string;

  @Column({ type: "boolean", default: false })
  isDefault!: boolean;
}
