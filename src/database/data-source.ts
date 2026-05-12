import "reflect-metadata";
import path from "path";
import { DataSource } from "typeorm";
import { env } from "@config/env";
import { Address } from "@modules/addresses/address.entity";
import { RefreshToken } from "@modules/auth/refreshToken.entity";
import { CartItem } from "@modules/cart/cartItem.entity";
import { Category } from "@modules/categories/category.entity";
import { InventoryLog } from "@modules/inventory/inventoryLog.entity";
import { Order } from "@modules/orders/order.entity";
import { OrderItem } from "@modules/orders/orderItem.entity";
import { Product } from "@modules/products/product.entity";
import { ProductVariant } from "@modules/products/productVariant.entity";
import { Review } from "@modules/reviews/review.entity";
import { User } from "@modules/users/user.entity";
import { WishlistItem } from "@modules/wishlist/wishlistItem.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: env.DATABASE_URL,
  synchronize: false,
  logging: false,
  entities: [
    User,
    Category,
    Product,
    ProductVariant,
    InventoryLog,
    Address,
    CartItem,
    WishlistItem,
    Order,
    OrderItem,
    Review,
    RefreshToken,
  ],
  // Single glob: avoids loading the same migration twice when both src/ and dist/ exist (e.g. after `npm run build`).
  migrations: [path.join(__dirname, "migrations", path.extname(__filename) === ".ts" ? "*.ts" : "*.js")],
});
