import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "@common/helpers/apiResponse";
import { CheckoutService } from "@modules/checkout/checkout.service";

export class CheckoutController {
  constructor(private readonly checkoutService = new CheckoutService()) {}

  summary = async (req: Request, res: Response): Promise<void> => {
    const { fromCart, lines } = req.body as { fromCart?: boolean; lines?: { variantId: string; quantity: number }[] };
    const data =
      fromCart === true
        ? await this.checkoutService.summaryFromUserCart(req.user!.id)
        : await this.checkoutService.summaryFromLines(lines ?? []);
    sendResponse(res, StatusCodes.OK, "Checkout summary", data);
  };
}
