import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "@common/exceptions/ApiError";
import { ApiResponse } from "@common/types/api";

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

  const response: ApiResponse = {
    success: false,
    message: "Internal server error",
  };
  res.status(500).json(response);
}
