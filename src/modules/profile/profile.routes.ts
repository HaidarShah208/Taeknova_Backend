import { Router } from "express";
import { authGuard } from "@common/guards/authGuard";
import { asyncHandler } from "@common/utils/asyncHandler";
import { validate } from "@common/middleware/validate";
import { ProfileController } from "@modules/profile/profile.controller";
import { profileChangePasswordSchema, profileUpdateSchema } from "@modules/profile/profile.schema";
import { upload } from "@modules/uploads/upload.middleware";

const profileController = new ProfileController();
export const profileRouter = Router();

profileRouter.use(authGuard);
profileRouter.get("/", asyncHandler(profileController.getMe));
profileRouter.patch("/", validate(profileUpdateSchema), asyncHandler(profileController.updateMe));
profileRouter.post("/change-password", validate(profileChangePasswordSchema), asyncHandler(profileController.changePassword));
profileRouter.post("/avatar", upload.single("image"), asyncHandler(profileController.uploadAvatar));
