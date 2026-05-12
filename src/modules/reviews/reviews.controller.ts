import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "@common/helpers/apiResponse";
import { ReviewService } from "@modules/reviews/review.service";

export class ReviewsController {
  constructor(private readonly reviewService = new ReviewService()) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const data = await this.reviewService.create(req.user!.id, req.body);
    sendResponse(res, StatusCodes.CREATED, "Review created", data);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const data = await this.reviewService.update(req.user!.id, String(req.params.reviewId), req.body);
    sendResponse(res, StatusCodes.OK, "Review updated", data);
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    await this.reviewService.remove(req.user!.id, String(req.params.reviewId));
    sendResponse(res, StatusCodes.OK, "Review deleted");
  };
}
