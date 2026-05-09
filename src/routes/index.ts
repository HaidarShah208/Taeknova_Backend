import { Router } from "express";
import { authRouter } from "@modules/auth/auth.routes";
import { categoriesRouter } from "@modules/categories/categories.routes";
import { inventoryRouter } from "@modules/inventory/inventory.routes";
import { productsRouter } from "@modules/products/products.routes";
import { usersRouter } from "@modules/users/users.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/products", productsRouter);
apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/inventory", inventoryRouter);
