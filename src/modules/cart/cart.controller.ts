import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "@common/helpers/apiResponse";
import { CartService } from "@modules/cart/cart.service";

export class CartController {
  constructor(private readonly cartService = new CartService()) {}

  getCart = async (req: Request, res: Response): Promise<void> => {
    const data = await this.cartService.getCart(req.user!.id);
    sendResponse(res, StatusCodes.OK, "Cart retrieved", data);
  };

  addItem = async (req: Request, res: Response): Promise<void> => {
    const data = await this.cartService.addItem(req.user!.id, req.body.variantId, req.body.quantity);
    sendResponse(res, StatusCodes.CREATED, "Item added to cart", data);
  };

  updateQuantity = async (req: Request, res: Response): Promise<void> => {
    const data = await this.cartService.updateQuantity(req.user!.id, String(req.params.variantId), req.body.quantity);
    sendResponse(res, StatusCodes.OK, "Cart updated", data);
  };

  removeItem = async (req: Request, res: Response): Promise<void> => {
    await this.cartService.removeItem(req.user!.id, String(req.params.variantId));
    sendResponse(res, StatusCodes.OK, "Item removed");
  };

  clear = async (req: Request, res: Response): Promise<void> => {
    await this.cartService.clearCart(req.user!.id);
    sendResponse(res, StatusCodes.OK, "Cart cleared");
  };
}
