import { Router } from "express";
import { authGuard } from "@common/guards/authGuard";
import { asyncHandler } from "@common/utils/asyncHandler";
import { validate } from "@common/middleware/validate";
import { WishlistController } from "@modules/wishlist/wishlist.controller";
import { wishlistAddSchema, wishlistProductParamSchema } from "@modules/wishlist/wishlist.schema";

const wishlistController = new WishlistController();
export const wishlistRouter = Router();

wishlistRouter.use(authGuard);
wishlistRouter.get("/", asyncHandler(wishlistController.list));
wishlistRouter.post("/items", validate(wishlistAddSchema), asyncHandler(wishlistController.add));
wishlistRouter.delete("/items/:productId", validate(wishlistProductParamSchema), asyncHandler(wishlistController.remove));
