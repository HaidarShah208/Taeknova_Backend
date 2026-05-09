import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { UserRole } from "@common/constants/roles";
import { ApiError } from "@common/exceptions/ApiError";

export function roleGuard(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
    if (!roles.includes(req.user.role)) {
      throw new ApiError(StatusCodes.FORBIDDEN, "Forbidden resource");
    }
    next();
  };
}
