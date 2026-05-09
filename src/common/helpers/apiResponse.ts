import { Response } from "express";
import { ApiResponse } from "@common/types/api";

export function sendResponse<T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  errors?: unknown,
): void {
  const payload: ApiResponse<T> = {
    success: statusCode < 400,
    message,
    data,
    errors,
  };

  if (data === undefined) delete payload.data;
  if (errors === undefined) delete payload.errors;

  res.status(statusCode).json(payload);
}
