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
}
