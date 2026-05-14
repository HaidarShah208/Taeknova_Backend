import type { CookieOptions, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { env } from "@config/env";
import { sendResponse } from "@common/helpers/apiResponse";
import { decodeTokenExpMs } from "@common/utils/jwt";
import { AuthService } from "@modules/auth/auth.service";

function refreshCookieOptions(maxAgeMs: number): CookieOptions {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAMESITE,
    path: "/",
    maxAge: maxAgeMs,
  };
}

function refreshCookieClearOptions(): CookieOptions {
  return {
    path: "/",
    sameSite: env.COOKIE_SAMESITE,
    secure: env.COOKIE_SECURE,
  };
}

export class AuthController {
  constructor(private readonly authService = new AuthService()) {}

  login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    const data = await this.authService.login(email, password);

    const expMs = decodeTokenExpMs(data.refreshToken);
    const maxAge = expMs ? Math.max(0, expMs - Date.now()) : 7 * 24 * 60 * 60 * 1000;
    res.cookie("refreshToken", data.refreshToken, refreshCookieOptions(maxAge));

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

    const expMs = decodeTokenExpMs(data.refreshToken);
    const maxAge = expMs ? Math.max(0, expMs - Date.now()) : 7 * 24 * 60 * 60 * 1000;
    res.cookie("refreshToken", data.refreshToken, refreshCookieOptions(maxAge));

    sendResponse(res, StatusCodes.OK, "Token refreshed", {
      accessToken: data.accessToken,
    });
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies.refreshToken as string | undefined;
    await this.authService.revokeRefreshToken(token);
    res.clearCookie("refreshToken", refreshCookieClearOptions());
    sendResponse(res, StatusCodes.OK, "Logout successful");
  };

  register = async (req: Request, res: Response): Promise<void> => {
    const { fullName, email, password } = req.body;
    const result = await this.authService.register(fullName, email, password);

    if (result.status === "pending_verification") {
      sendResponse(res, StatusCodes.CREATED, result.message, {
        requiresEmailVerification: true,
        email: result.email,
      });
      return;
    }

    const expMs = decodeTokenExpMs(result.refreshToken);
    const maxAge = expMs ? Math.max(0, expMs - Date.now()) : 7 * 24 * 60 * 60 * 1000;
    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions(maxAge));
    sendResponse(res, StatusCodes.CREATED, result.message, {
      requiresEmailVerification: false,
      accessToken: result.accessToken,
      user: result.user,
    });
  };

  verifyEmail = async (req: Request, res: Response): Promise<void> => {
    const token = String(req.query.token ?? "");
    const data = await this.authService.verifyEmailWithToken(token);
    sendResponse(res, StatusCodes.OK, data.message, { verified: true });
  };
}
