import { Column, Entity, Index } from "typeorm";
import { BaseEntity } from "@database/entities/BaseEntity";

@Entity("inventory_logs")
@Index(["productId", "variantId"])
export class InventoryLog extends BaseEntity {
  @Column({ type: "uuid" })
  productId!: string;

  @Column({ type: "uuid", nullable: true })
  variantId?: string;

  @Column({ type: "int" })
  previousQuantity!: number;

  @Column({ type: "int" })
  newQuantity!: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  reason?: string;
}
