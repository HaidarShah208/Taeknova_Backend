import { MigrationInterface, QueryRunner } from "typeorm";

export class CustomerCommerceTables1715260000000 implements MigrationInterface {
  name = "CustomerCommerceTables1715260000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "users" ADD COLUMN "avatarUrl" character varying(500)');

    await queryRunner.query(
      'CREATE TABLE "addresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "label" character varying(80) NOT NULL, "recipientName" character varying(120) NOT NULL, "phone" character varying(40), "line1" character varying(180) NOT NULL, "line2" character varying(180), "city" character varying(100) NOT NULL, "state" character varying(100), "postalCode" character varying(24) NOT NULL, "country" character varying(80) NOT NULL, "isDefault" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_addresses_id" PRIMARY KEY ("id"))',
    );
    await queryRunner.query('CREATE INDEX "IDX_addresses_user_default" ON "addresses" ("userId", "isDefault") ');
    await queryRunner.query(
      'ALTER TABLE "addresses" ADD CONSTRAINT "FK_addresses_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );

    await queryRunner.query(
      'CREATE TABLE "cart_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "variantId" uuid NOT NULL, "quantity" integer NOT NULL DEFAULT 1, CONSTRAINT "UQ_cart_user_variant" UNIQUE ("userId", "variantId"), CONSTRAINT "PK_cart_items_id" PRIMARY KEY ("id"))',
    );
    await queryRunner.query('CREATE INDEX "IDX_cart_items_userId" ON "cart_items" ("userId") ');
    await queryRunner.query(
      'ALTER TABLE "cart_items" ADD CONSTRAINT "FK_cart_items_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "cart_items" ADD CONSTRAINT "FK_cart_items_variantId" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );

    await queryRunner.query(
      'CREATE TABLE "wishlist_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "productId" uuid NOT NULL, CONSTRAINT "UQ_wishlist_user_product" UNIQUE ("userId", "productId"), CONSTRAINT "PK_wishlist_items_id" PRIMARY KEY ("id"))',
    );
    await queryRunner.query('CREATE INDEX "IDX_wishlist_items_userId" ON "wishlist_items" ("userId") ');
    await queryRunner.query(
      'ALTER TABLE "wishlist_items" ADD CONSTRAINT "FK_wishlist_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "wishlist_items" ADD CONSTRAINT "FK_wishlist_productId" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );

    await queryRunner.query(
      'CREATE TYPE "public"."orders_status_enum" AS ENUM(\'PENDING\', \'CONFIRMED\', \'PROCESSING\', \'SHIPPED\', \'DELIVERED\', \'CANCELLED\')',
    );
    await queryRunner.query(
      'CREATE TYPE "public"."orders_paymentstatus_enum" AS ENUM(\'AWAITING\', \'PAID\', \'FAILED\', \'REFUNDED\')',
    );
    await queryRunner.query(
      'CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "status" "public"."orders_status_enum" NOT NULL DEFAULT \'PENDING\', "paymentStatus" "public"."orders_paymentstatus_enum" NOT NULL DEFAULT \'AWAITING\', "shippingAddressSnapshot" jsonb NOT NULL, "currency" character varying(80) NOT NULL DEFAULT \'USD\', "subtotalAmount" numeric(12,2) NOT NULL, "shippingAmount" numeric(12,2) NOT NULL DEFAULT 0, "taxAmount" numeric(12,2) NOT NULL DEFAULT 0, "totalAmount" numeric(12,2) NOT NULL, "shippingMethod" character varying(120), "customerNotes" text, CONSTRAINT "PK_orders_id" PRIMARY KEY ("id"))',
    );
    await queryRunner.query('CREATE INDEX "IDX_orders_user_status" ON "orders" ("userId", "status") ');
    await queryRunner.query(
      'ALTER TABLE "orders" ADD CONSTRAINT "FK_orders_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION',
    );

    await queryRunner.query(
      'CREATE TABLE "order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "orderId" uuid NOT NULL, "variantId" uuid NOT NULL, "productId" uuid NOT NULL, "productName" character varying(200) NOT NULL, "sku" character varying(120) NOT NULL, "variantLabel" character varying(80) NOT NULL, "quantity" integer NOT NULL, "unitPrice" numeric(12,2) NOT NULL, "lineTotal" numeric(12,2) NOT NULL, CONSTRAINT "PK_order_items_id" PRIMARY KEY ("id"))',
    );
    await queryRunner.query('CREATE INDEX "IDX_order_items_orderId" ON "order_items" ("orderId") ');
    await queryRunner.query(
      'ALTER TABLE "order_items" ADD CONSTRAINT "FK_order_items_orderId" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "order_items" ADD CONSTRAINT "FK_order_items_variantId" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE NO ACTION',
    );

    await queryRunner.query(
      'CREATE TABLE "reviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "productId" uuid NOT NULL, "rating" integer NOT NULL, "title" character varying(160), "body" text, CONSTRAINT "UQ_reviews_user_product" UNIQUE ("userId", "productId"), CONSTRAINT "PK_reviews_id" PRIMARY KEY ("id"))',
    );
    await queryRunner.query('CREATE INDEX "IDX_reviews_productId" ON "reviews" ("productId") ');
    await queryRunner.query(
      'ALTER TABLE "reviews" ADD CONSTRAINT "FK_reviews_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "reviews" ADD CONSTRAINT "FK_reviews_productId" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );

    await queryRunner.query('CREATE INDEX "IDX_products_status_featured" ON "products" ("status", "isFeatured") ');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "public"."IDX_products_status_featured"');
    await queryRunner.query('ALTER TABLE "reviews" DROP CONSTRAINT "FK_reviews_productId"');
    await queryRunner.query('ALTER TABLE "reviews" DROP CONSTRAINT "FK_reviews_userId"');
    await queryRunner.query('DROP INDEX "public"."IDX_reviews_productId"');
    await queryRunner.query('DROP TABLE "reviews"');
    await queryRunner.query('ALTER TABLE "order_items" DROP CONSTRAINT "FK_order_items_variantId"');
    await queryRunner.query('ALTER TABLE "order_items" DROP CONSTRAINT "FK_order_items_orderId"');
    await queryRunner.query('DROP INDEX "public"."IDX_order_items_orderId"');
    await queryRunner.query('DROP TABLE "order_items"');
    await queryRunner.query('ALTER TABLE "orders" DROP CONSTRAINT "FK_orders_userId"');
    await queryRunner.query('DROP INDEX "public"."IDX_orders_user_status"');
    await queryRunner.query('DROP TABLE "orders"');
    await queryRunner.query('DROP TYPE "public"."orders_paymentstatus_enum"');
    await queryRunner.query('DROP TYPE "public"."orders_status_enum"');
    await queryRunner.query('ALTER TABLE "wishlist_items" DROP CONSTRAINT "FK_wishlist_productId"');
    await queryRunner.query('ALTER TABLE "wishlist_items" DROP CONSTRAINT "FK_wishlist_userId"');
    await queryRunner.query('DROP INDEX "public"."IDX_wishlist_items_userId"');
    await queryRunner.query('DROP TABLE "wishlist_items"');
    await queryRunner.query('ALTER TABLE "cart_items" DROP CONSTRAINT "FK_cart_items_variantId"');
    await queryRunner.query('ALTER TABLE "cart_items" DROP CONSTRAINT "FK_cart_items_userId"');
    await queryRunner.query('DROP INDEX "public"."IDX_cart_items_userId"');
    await queryRunner.query('DROP TABLE "cart_items"');
    await queryRunner.query('ALTER TABLE "addresses" DROP CONSTRAINT "FK_addresses_userId"');
    await queryRunner.query('DROP INDEX "public"."IDX_addresses_user_default"');
    await queryRunner.query('DROP TABLE "addresses"');
    await queryRunner.query('ALTER TABLE "users" DROP COLUMN "avatarUrl"');
  }
}
