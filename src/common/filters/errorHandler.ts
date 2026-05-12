import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { QueryFailedError } from "typeorm";
import { ZodError } from "zod";
import { env } from "@config/env";
import { ApiError } from "@common/exceptions/ApiError";
import { ApiResponse } from "@common/types/api";

function pgErrorCode(error: unknown): string | undefined {
  if (error && typeof error === "object") {
    const o = error as { code?: unknown; driverError?: { code?: unknown } };
    if (typeof o.code === "string") return o.code;
    if (o.driverError && typeof o.driverError === "object" && typeof o.driverError.code === "string") {
      return o.driverError.code;
    }
  }
  return undefined;
}

export function errorHandler(error: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof ApiError) {
    const response: ApiResponse = {
      success: false,
      message: error.message,
      errors: error.details ?? null,
    };
    res.status(error.statusCode).json(response);
    return;
  }

  if (error instanceof ZodError) {
    const response: ApiResponse = {
      success: false,
      message: "Validation failed",
      errors: error.flatten(),
    };
    res.status(400).json(response);
    return;
  }

  if (error instanceof QueryFailedError) {
    const code = pgErrorCode(error);
    if (code === "23505") {
      const response: ApiResponse = {
        success: false,
        message: "A record with this value already exists",
      };
      res.status(StatusCodes.CONFLICT).json(response);
      return;
    }
  }

  if (env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.error("[errorHandler]", error);
  }

  const response: ApiResponse = {
    success: false,
    message: "Internal server error",
  };
  res.status(500).json(response);
}
