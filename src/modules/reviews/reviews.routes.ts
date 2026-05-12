import { Router } from "express";
import { authGuard } from "@common/guards/authGuard";
import { asyncHandler } from "@common/utils/asyncHandler";
import { validate } from "@common/middleware/validate";
import { ReviewsController } from "@modules/reviews/reviews.controller";
import { reviewCreateSchema, reviewIdParamSchema, reviewUpdateSchema } from "@modules/reviews/reviews.schema";

const reviewsController = new ReviewsController();
export const reviewsRouter = Router();

reviewsRouter.use(authGuard);
reviewsRouter.post("/", validate(reviewCreateSchema), asyncHandler(reviewsController.create));
reviewsRouter.patch("/:reviewId", validate(reviewUpdateSchema), asyncHandler(reviewsController.update));
reviewsRouter.delete("/:reviewId", validate(reviewIdParamSchema), asyncHandler(reviewsController.remove));
