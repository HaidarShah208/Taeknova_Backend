import { Router } from "express";
import { UserRole } from "@common/constants/roles";
import { authGuard } from "@common/guards/authGuard";
import { roleGuard } from "@common/guards/roleGuard";
import { validate } from "@common/middleware/validate";
import { asyncHandler } from "@common/utils/asyncHandler";
import { CategoryController } from "@modules/categories/category.controller";
import { createCategorySchema, updateCategorySchema } from "@modules/categories/category.schema";

const categoryController = new CategoryController();
export const categoriesRouter = Router();

categoriesRouter.use(authGuard, roleGuard(UserRole.ADMIN));
categoriesRouter.get("/", asyncHandler(categoryController.list));
categoriesRouter.post("/", validate(createCategorySchema), asyncHandler(categoryController.create));
categoriesRouter.patch("/:categoryId", validate(updateCategorySchema), asyncHandler(categoryController.update));
categoriesRouter.delete("/:categoryId", asyncHandler(categoryController.remove));
