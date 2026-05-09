import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "@common/exceptions/ApiError";
import { verifyAccessToken } from "@common/utils/jwt";

export function authGuard(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Access token is required");
  }

  const payload = verifyAccessToken(token);
  req.user = payload;
  next();
}
