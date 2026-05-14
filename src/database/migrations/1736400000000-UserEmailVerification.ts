import { MigrationInterface, QueryRunner } from "typeorm";

export class UserEmailVerification1736400000000 implements MigrationInterface {
  name = "UserEmailVerification1736400000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "emailVerifiedAt" TIMESTAMPTZ`);
    await queryRunner.query(`ALTER TABLE "users" ADD "emailVerificationToken" character varying(64)`);
    await queryRunner.query(`ALTER TABLE "users" ADD "emailVerificationExpiresAt" TIMESTAMPTZ`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_users_emailVerificationToken" ON "users" ("emailVerificationToken") WHERE "emailVerificationToken" IS NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE "users" SET "emailVerifiedAt" = now() WHERE "emailVerifiedAt" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_users_emailVerificationToken"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "emailVerificationExpiresAt"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "emailVerificationToken"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "emailVerifiedAt"`);
  }
}
