import { Router } from "express";
import { UserRole } from "@common/constants/roles";
import { authGuard } from "@common/guards/authGuard";
import { roleGuard } from "@common/guards/roleGuard";
import { validate } from "@common/middleware/validate";
import { asyncHandler } from "@common/utils/asyncHandler";
import { UserController } from "@modules/users/user.controller";
import { createAdminSchema, removeUserSchema } from "@modules/users/user.schema";

const userController = new UserController();
export const usersRouter = Router();

usersRouter.post(
  "/admins",
  authGuard,
  roleGuard(UserRole.ADMIN),
  validate(createAdminSchema),
  asyncHandler(userController.createAdmin),
);

usersRouter.get("/", authGuard, roleGuard(UserRole.ADMIN), asyncHandler(userController.listAll));

usersRouter.delete(
  "/:userId",
  authGuard,
  roleGuard(UserRole.ADMIN),
  validate(removeUserSchema),
  asyncHandler(userController.deactivateById),
);
