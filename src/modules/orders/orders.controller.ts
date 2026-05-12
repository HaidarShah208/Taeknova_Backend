import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "@common/helpers/apiResponse";
import { OrdersService } from "@modules/orders/orders.service";

export class OrdersController {
  constructor(private readonly ordersService = new OrdersService()) {}

  listMine = async (req: Request, res: Response): Promise<void> => {
    const q = req.query as { page?: string; limit?: string };
    const data = await this.ordersService.listMine(req.user!.id, Number(q.page) || 1, Number(q.limit) || 20);
    sendResponse(res, StatusCodes.OK, "Orders retrieved", data);
  };

  listAllAdmin = async (req: Request, res: Response): Promise<void> => {
    const q = req.query as { page?: string; limit?: string };
    const data = await this.ordersService.listAllForAdmin(Number(q.page) || 1, Number(q.limit) || 20);
    sendResponse(res, StatusCodes.OK, "Orders retrieved", data);
  };

  approveAdmin = async (req: Request, res: Response): Promise<void> => {
    const data = await this.ordersService.approveByAdmin(String(req.params.orderId));
    sendResponse(res, StatusCodes.OK, "Order accepted", data);
  };

  rejectAdmin = async (req: Request, res: Response): Promise<void> => {
    await this.ordersService.rejectByAdmin(String(req.params.orderId));
    sendResponse(res, StatusCodes.OK, "Order rejected");
  };

  shipAdmin = async (req: Request, res: Response): Promise<void> => {
    const data = await this.ordersService.shipByAdmin(String(req.params.orderId));
    sendResponse(res, StatusCodes.OK, "Order marked shipped", data);
  };

  deliverAdmin = async (req: Request, res: Response): Promise<void> => {
    const data = await this.ordersService.deliverByAdmin(String(req.params.orderId));
    sendResponse(res, StatusCodes.OK, "Order marked delivered", data);
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const data = await this.ordersService.createFromCart({
      userId: req.user!.id,
      addressId: req.body.addressId,
      shippingMethod: req.body.shippingMethod,
      customerNotes: req.body.customerNotes,
      paymentMethod: req.body.paymentMethod,
      paymentProofUrl: req.body.paymentProofUrl ?? null,
    });
    sendResponse(res, StatusCodes.CREATED, "Order placed", data);
  };

  uploadPaymentProof = async (req: Request, res: Response): Promise<void> => {
    if (!req.file?.buffer) {
      sendResponse(res, StatusCodes.BAD_REQUEST, "Image file is required");
      return;
    }
    const data = await this.ordersService.uploadPaymentProofImage(req.file.buffer);
    sendResponse(res, StatusCodes.OK, "Proof uploaded", data);
  };

  getMine = async (req: Request, res: Response): Promise<void> => {
    const data = await this.ordersService.getMine(req.user!.id, String(req.params.orderId));
    sendResponse(res, StatusCodes.OK, "Order retrieved", data);
  };

  cancelMine = async (req: Request, res: Response): Promise<void> => {
    await this.ordersService.cancelMine(req.user!.id, String(req.params.orderId));
    sendResponse(res, StatusCodes.OK, "Order cancelled");
  };
}
