import { IsNull, MoreThan, Repository } from "typeorm";
import { AppDataSource } from "@database/data-source";
import { RefreshToken } from "@modules/auth/refreshToken.entity";

export class RefreshTokenRepository {
  private readonly repo: Repository<RefreshToken> = AppDataSource.getRepository(RefreshToken);

  create(partial: Pick<RefreshToken, "userId" | "jti" | "expiresAt">): RefreshToken {
    return this.repo.create({ ...partial, revokedAt: null });
  }

  save(row: RefreshToken): Promise<RefreshToken> {
    return this.repo.save(row);
  }

  findActiveByJti(jti: string): Promise<RefreshToken | null> {
    return this.repo.findOne({
      where: {
        jti,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
    });
  }

  async revokeByJti(jti: string): Promise<void> {
    await this.repo.update({ jti }, { revokedAt: new Date() });
  }

  async revokeAllActiveForUser(userId: string): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update(RefreshToken)
      .set({ revokedAt: new Date() })
      .where("userId = :userId", { userId })
      .andWhere("revokedAt IS NULL")
      .execute();
  }
}
