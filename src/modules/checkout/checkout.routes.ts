import { Router } from "express";
import { authGuard } from "@common/guards/authGuard";
import { asyncHandler } from "@common/utils/asyncHandler";
import { validate } from "@common/middleware/validate";
import { CheckoutController } from "@modules/checkout/checkout.controller";
import { checkoutSummarySchema } from "@modules/checkout/checkout.schema";

const checkoutController = new CheckoutController();
export const checkoutRouter = Router();

checkoutRouter.use(authGuard);
checkoutRouter.post("/summary", validate(checkoutSummarySchema), asyncHandler(checkoutController.summary));
