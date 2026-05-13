import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "@common/helpers/apiResponse";
import { UserService } from "@modules/users/user.service";

export class UserController {
  constructor(private readonly userService = new UserService()) {}

  createAdmin = async (req: Request, res: Response): Promise<void> => {
    const user = await this.userService.createAdmin(req.body);
    sendResponse(res, StatusCodes.CREATED, "Admin user created", user);
  };

  listAll = async (_req: Request, res: Response): Promise<void> => {
    const users = await this.userService.listAllUsers();
    sendResponse(res, StatusCodes.OK, "Users fetched", users);
  };

  deactivateById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      sendResponse(res, StatusCodes.UNAUTHORIZED, "Unauthorized", null);
      return;
    }
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    await this.userService.deactivateUserById(userId, req.user.id);
    sendResponse(res, StatusCodes.OK, "User account removed", null);
  };
}
