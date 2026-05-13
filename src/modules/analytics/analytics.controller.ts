import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "@common/helpers/apiResponse";
import { AnalyticsService } from "@modules/analytics/analytics.service";

export class AnalyticsController {
  constructor(private readonly analyticsService = new AnalyticsService()) {}

  getAdminOverview = async (_req: Request, res: Response): Promise<void> => {
    const data = await this.analyticsService.getAdminOverview();
    sendResponse(res, StatusCodes.OK, "Admin analytics fetched", data);
  };
}
