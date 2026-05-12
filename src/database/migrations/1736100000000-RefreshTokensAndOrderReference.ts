import { MigrationInterface, QueryRunner } from "typeorm";

export class RefreshTokensAndOrderReference1736100000000 implements MigrationInterface {
  name = "RefreshTokensAndOrderReference1736100000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "userId" uuid NOT NULL,
        "jti" character varying(36) NOT NULL,
        "expiresAt" TIMESTAMPTZ NOT NULL,
        "revokedAt" TIMESTAMPTZ,
        CONSTRAINT "UQ_refresh_tokens_jti" UNIQUE ("jti"),
        CONSTRAINT "PK_refresh_tokens_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query('CREATE INDEX "IDX_refresh_tokens_userId" ON "refresh_tokens" ("userId") ');
    await queryRunner.query(
      'ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_refresh_tokens_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );

    await queryRunner.query(
      'ALTER TABLE "orders" ADD COLUMN "reference" character varying(32)',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "UQ_orders_reference" ON "orders" ("reference") WHERE "reference" IS NOT NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "public"."UQ_orders_reference"');
    await queryRunner.query('ALTER TABLE "orders" DROP COLUMN "reference"');
    await queryRunner.query('ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_refresh_tokens_userId"');
    await queryRunner.query('DROP INDEX "public"."IDX_refresh_tokens_userId"');
    await queryRunner.query('DROP TABLE "refresh_tokens"');
  }
}
