import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "@database/entities/BaseEntity";
import { User } from "@modules/users/user.entity";

@Entity("refresh_tokens")
@Index(["userId"])
export class RefreshToken extends BaseEntity {
  @Column({ type: "uuid" })
  userId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 36 })
  jti!: string;

  @Column({ type: "timestamptz" })
  expiresAt!: Date;

  @Column({ type: "timestamptz", nullable: true })
  revokedAt!: Date | null;
}
