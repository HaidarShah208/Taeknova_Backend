import { MigrationInterface, QueryRunner } from "typeorm";

export class InitAdminCoreTables1715240000000 implements MigrationInterface {
  name = "InitAdminCoreTables1715240000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await queryRunner.query('CREATE TYPE "public"."users_role_enum" AS ENUM(\'ADMIN\', \'USER\')');
    await queryRunner.query(
      'CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "email" character varying(120) NOT NULL, "fullName" character varying(120) NOT NULL, "passwordHash" character varying(255) NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT \'USER\', "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_users_email" UNIQUE ("email"), CONSTRAINT "PK_users_id" PRIMARY KEY ("id"))',
    );
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_users_email" ON "users" ("email") ');

    await queryRunner.query(
      'CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "name" character varying(120) NOT NULL, "slug" character varying(160) NOT NULL, "description" text, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_categories_name" UNIQUE ("name"), CONSTRAINT "UQ_categories_slug" UNIQUE ("slug"), CONSTRAINT "PK_categories_id" PRIMARY KEY ("id"))',
    );
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_categories_name" ON "categories" ("name") ');

    await queryRunner.query('CREATE TYPE "public"."products_status_enum" AS ENUM(\'PENDING\', \'APPROVED\', \'REJECTED\')');
    await queryRunner.query('CREATE TYPE "public"."products_stockstatus_enum" AS ENUM(\'IN_STOCK\', \'LOW_STOCK\', \'OUT_OF_STOCK\')');
    await queryRunner.query(
      'CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "name" character varying(180) NOT NULL, "slug" character varying(200) NOT NULL, "description" text, "basePrice" numeric(10,2) NOT NULL, "isFeatured" boolean NOT NULL DEFAULT false, "imageUrls" text array NOT NULL DEFAULT \'{}\', "status" "public"."products_status_enum" NOT NULL DEFAULT \'PENDING\', "stockStatus" "public"."products_stockstatus_enum" NOT NULL DEFAULT \'IN_STOCK\', "categoryId" uuid NOT NULL, "createdById" uuid NOT NULL, CONSTRAINT "UQ_products_slug" UNIQUE ("slug"), CONSTRAINT "PK_products_id" PRIMARY KEY ("id"))',
    );
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_products_slug" ON "products" ("slug") ');
    await queryRunner.query('CREATE INDEX "IDX_products_name_status" ON "products" ("name", "status") ');

    await queryRunner.query(
      'CREATE TABLE "product_variants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "productId" uuid NOT NULL, "size" character varying(30) NOT NULL, "color" character varying(50) NOT NULL, "sku" character varying(120) NOT NULL, "stockQuantity" integer NOT NULL DEFAULT 0, "variantPrice" numeric(10,2), CONSTRAINT "UQ_product_variants_sku" UNIQUE ("sku"), CONSTRAINT "PK_product_variants_id" PRIMARY KEY ("id"))',
    );
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_product_variants_product_size_color" ON "product_variants" ("productId", "size", "color") ');

    await queryRunner.query(
      'CREATE TABLE "inventory_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "productId" uuid NOT NULL, "variantId" uuid, "previousQuantity" integer NOT NULL, "newQuantity" integer NOT NULL, "reason" character varying(255), CONSTRAINT "PK_inventory_logs_id" PRIMARY KEY ("id"))',
    );
    await queryRunner.query('CREATE INDEX "IDX_inventory_logs_product_variant" ON "inventory_logs" ("productId", "variantId") ');

    await queryRunner.query(
      'ALTER TABLE "products" ADD CONSTRAINT "FK_products_categoryId" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "products" ADD CONSTRAINT "FK_products_createdById" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "product_variants" ADD CONSTRAINT "FK_product_variants_productId" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "product_variants" DROP CONSTRAINT "FK_product_variants_productId"');
    await queryRunner.query('ALTER TABLE "products" DROP CONSTRAINT "FK_products_createdById"');
    await queryRunner.query('ALTER TABLE "products" DROP CONSTRAINT "FK_products_categoryId"');
    await queryRunner.query('DROP INDEX "public"."IDX_inventory_logs_product_variant"');
    await queryRunner.query('DROP TABLE "inventory_logs"');
    await queryRunner.query('DROP INDEX "public"."IDX_product_variants_product_size_color"');
    await queryRunner.query('DROP TABLE "product_variants"');
    await queryRunner.query('DROP INDEX "public"."IDX_products_name_status"');
    await queryRunner.query('DROP INDEX "public"."IDX_products_slug"');
    await queryRunner.query('DROP TABLE "products"');
    await queryRunner.query('DROP TYPE "public"."products_stockstatus_enum"');
    await queryRunner.query('DROP TYPE "public"."products_status_enum"');
    await queryRunner.query('DROP INDEX "public"."IDX_categories_name"');
    await queryRunner.query('DROP TABLE "categories"');
    await queryRunner.query('DROP INDEX "public"."IDX_users_email"');
    await queryRunner.query('DROP TABLE "users"');
    await queryRunner.query('DROP TYPE "public"."users_role_enum"');
  }
}
