import { Router } from "express";
import { UserRole } from "@common/constants/roles";
import { authGuard } from "@common/guards/authGuard";
import { roleGuard } from "@common/guards/roleGuard";
import { validate } from "@common/middleware/validate";
import { asyncHandler } from "@common/utils/asyncHandler";
import { ProductController } from "@modules/products/product.controller";
import { createProductSchema, listProductQuerySchema, productIdParamSchema, updateProductSchema } from "@modules/products/product.schema";
import { upload } from "@modules/uploads/upload.middleware";

const productController = new ProductController();
export const productsRouter = Router();

productsRouter.use(authGuard, roleGuard(UserRole.ADMIN));
productsRouter.get("/", validate(listProductQuerySchema), asyncHandler(productController.list));
productsRouter.post("/", validate(createProductSchema), asyncHandler(productController.create));
productsRouter.patch("/:productId", validate(updateProductSchema), asyncHandler(productController.update));
productsRouter.delete("/:productId", validate(productIdParamSchema), asyncHandler(productController.remove));
productsRouter.patch("/:productId/approve", validate(productIdParamSchema), asyncHandler(productController.approve));
productsRouter.patch("/:productId/reject", validate(productIdParamSchema), asyncHandler(productController.reject));
productsRouter.post(
  "/:productId/images",
  validate(productIdParamSchema),
  upload.single("image"),
  asyncHandler(productController.uploadImage),
);
