import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { env } from "@config/env";
import { sendResponse } from "@common/helpers/apiResponse";
import { AuthService } from "@modules/auth/auth.service";

export class AuthController {
  constructor(private readonly authService = new AuthService()) {}

  login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    const data = await this.authService.login(email, password);

    res.cookie("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendResponse(res, StatusCodes.OK, "Login successful", {
      accessToken: data.accessToken,
      user: data.user,
    });
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    const tokenFromCookie = req.cookies.refreshToken as string | undefined;
    const tokenFromBody = req.body.refreshToken as string | undefined;
    const refreshToken = tokenFromCookie ?? tokenFromBody;
    if (!refreshToken) {
      sendResponse(res, StatusCodes.UNAUTHORIZED, "Refresh token is required");
      return;
    }

    const data = await this.authService.refresh(refreshToken);

    res.cookie("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendResponse(res, StatusCodes.OK, "Token refreshed", {
      accessToken: data.accessToken,
    });
  };

  logout = async (_req: Request, res: Response): Promise<void> => {
    res.clearCookie("refreshToken");
    sendResponse(res, StatusCodes.OK, "Logout successful");
  };
}
