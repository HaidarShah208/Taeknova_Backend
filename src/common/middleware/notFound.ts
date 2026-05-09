import { Request, Response } from "express";
import { sendResponse } from "@common/helpers/apiResponse";

export function notFound(_req: Request, res: Response): void {
  sendResponse(res, 404, "Route not found");
}
