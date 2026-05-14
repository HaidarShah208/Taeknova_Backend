import { MigrationInterface, QueryRunner } from "typeorm";

export class PasswordResetFields1736500000000 implements MigrationInterface {
  name = "PasswordResetFields1736500000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "passwordResetToken" character varying(64)`);
    await queryRunner.query(`ALTER TABLE "users" ADD "passwordResetExpiresAt" TIMESTAMPTZ`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_users_passwordResetToken" ON "users" ("passwordResetToken") WHERE "passwordResetToken" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_users_passwordResetToken"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "passwordResetExpiresAt"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "passwordResetToken"`);
  }
}
