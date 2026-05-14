import { Router } from "express";
import { asyncHandler } from "@common/utils/asyncHandler";
import { validate } from "@common/middleware/validate";
import { AuthController } from "@modules/auth/auth.controller";
import { loginSchema, refreshTokenSchema } from "@modules/auth/auth.schema";
import { registerSchema } from "@modules/auth/register.schema";
import { verifyEmailQuerySchema } from "@modules/auth/verify-email.schema";

const authController = new AuthController();
export const authRouter = Router();

authRouter.get(
  "/verify-email",
  validate(verifyEmailQuerySchema),
  asyncHandler(authController.verifyEmail),
);
authRouter.post("/register", validate(registerSchema), asyncHandler(authController.register));
authRouter.post("/login", validate(loginSchema), asyncHandler(authController.login));
authRouter.post("/refresh", validate(refreshTokenSchema), asyncHandler(authController.refresh));
authRouter.post("/logout", asyncHandler(authController.logout));
