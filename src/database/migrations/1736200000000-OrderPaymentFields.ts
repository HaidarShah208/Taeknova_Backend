import { MigrationInterface, QueryRunner } from "typeorm";

export class OrderPaymentFields1736200000000 implements MigrationInterface {
  name = "OrderPaymentFields1736200000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN "paymentMethod" character varying(40)`,
    );
    await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN "paymentProofUrl" text`);
    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN "codFeeAmount" numeric(12,2) NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "codFeeAmount"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "paymentProofUrl"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "paymentMethod"`);
  }
}
