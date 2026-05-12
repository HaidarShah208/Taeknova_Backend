import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "@common/helpers/apiResponse";
import { WishlistService } from "@modules/wishlist/wishlist.service";

export class WishlistController {
  constructor(private readonly wishlistService = new WishlistService()) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const data = await this.wishlistService.list(req.user!.id);
    sendResponse(res, StatusCodes.OK, "Wishlist retrieved", data);
  };

  add = async (req: Request, res: Response): Promise<void> => {
    const data = await this.wishlistService.add(req.user!.id, req.body.productId);
    sendResponse(res, StatusCodes.CREATED, "Added to wishlist", data);
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    await this.wishlistService.remove(req.user!.id, String(req.params.productId));
    sendResponse(res, StatusCodes.OK, "Removed from wishlist");
  };
}
