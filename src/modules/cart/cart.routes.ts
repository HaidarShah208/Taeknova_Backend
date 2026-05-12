import { Router } from "express";
import { authGuard } from "@common/guards/authGuard";
import { asyncHandler } from "@common/utils/asyncHandler";
import { validate } from "@common/middleware/validate";
import { CartController } from "@modules/cart/cart.controller";
import { cartAddSchema, cartUpdateQuantitySchema, cartVariantParamSchema } from "@modules/cart/cart.schema";

const cartController = new CartController();
export const cartRouter = Router();

cartRouter.use(authGuard);
cartRouter.get("/", asyncHandler(cartController.getCart));
cartRouter.post("/items", validate(cartAddSchema), asyncHandler(cartController.addItem));
cartRouter.patch("/items/:variantId", validate(cartUpdateQuantitySchema), asyncHandler(cartController.updateQuantity));
cartRouter.delete("/items/:variantId", validate(cartVariantParamSchema), asyncHandler(cartController.removeItem));
cartRouter.delete("/", asyncHandler(cartController.clear));
