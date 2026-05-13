import { Router } from "express";
import { UserRole } from "@common/constants/roles";
import { authGuard } from "@common/guards/authGuard";
import { roleGuard } from "@common/guards/roleGuard";
import { asyncHandler } from "@common/utils/asyncHandler";
import { AnalyticsController } from "@modules/analytics/analytics.controller";

const analyticsController = new AnalyticsController();
export const analyticsRouter = Router();

analyticsRouter.use(authGuard, roleGuard(UserRole.ADMIN));
analyticsRouter.get("/admin/overview", asyncHandler(analyticsController.getAdminOverview));
