import "reflect-metadata";
import path from "path";
import { DataSource } from "typeorm";
import { env } from "@config/env";
import { Category } from "@modules/categories/category.entity";
import { InventoryLog } from "@modules/inventory/inventoryLog.entity";
import { Product } from "@modules/products/product.entity";
import { ProductVariant } from "@modules/products/productVariant.entity";
import { User } from "@modules/users/user.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: env.DATABASE_URL,
  synchronize: false,
  logging: false,
  entities: [User, Category, Product, ProductVariant, InventoryLog],
  // Single glob: avoids loading the same migration twice when both src/ and dist/ exist (e.g. after `npm run build`).
  migrations: [path.join(__dirname, "migrations", path.extname(__filename) === ".ts" ? "*.ts" : "*.js")],
});
