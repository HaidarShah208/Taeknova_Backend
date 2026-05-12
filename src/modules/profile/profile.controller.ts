import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "@common/helpers/apiResponse";
import { ProfileService } from "@modules/profile/profile.service";

export class ProfileController {
  constructor(private readonly profileService = new ProfileService()) {}

  getMe = async (req: Request, res: Response): Promise<void> => {
    const data = await this.profileService.getProfile(req.user!.id);
    sendResponse(res, StatusCodes.OK, "Profile retrieved", data);
  };

  updateMe = async (req: Request, res: Response): Promise<void> => {
    const data = await this.profileService.updateProfile(req.user!.id, req.body);
    sendResponse(res, StatusCodes.OK, "Profile updated", data);
  };

  changePassword = async (req: Request, res: Response): Promise<void> => {
    await this.profileService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
    sendResponse(res, StatusCodes.OK, "Password updated");
  };

  uploadAvatar = async (req: Request, res: Response): Promise<void> => {
    if (!req.file?.buffer) {
      sendResponse(res, StatusCodes.BAD_REQUEST, "Image file is required");
      return;
    }
    const data = await this.profileService.uploadAvatar(req.user!.id, req.file.buffer);
    sendResponse(res, StatusCodes.OK, "Avatar updated", data);
  };
}
