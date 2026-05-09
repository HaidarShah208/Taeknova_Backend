import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "@common/helpers/apiResponse";
import { ProductService } from "@modules/products/product.service";
import { ProductStatus } from "@modules/products/product.types";

export class ProductController {
  constructor(private readonly productService = new ProductService()) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const data = await this.productService.list(req.query as unknown as { page: number; limit: number; search?: string; status?: ProductStatus });
    sendResponse(res, StatusCodes.OK, "Products fetched", data);
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const data = await this.productService.create(req.body, req.user!.id);
    sendResponse(res, StatusCodes.CREATED, "Product created", data);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const data = await this.productService.update(String(req.params.productId), req.body);
    sendResponse(res, StatusCodes.OK, "Product updated", data);
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    await this.productService.remove(String(req.params.productId));
    sendResponse(res, StatusCodes.OK, "Product deleted");
  };

  approve = async (req: Request, res: Response): Promise<void> => {
    const data = await this.productService.setApprovalStatus(String(req.params.productId), ProductStatus.APPROVED);
    sendResponse(res, StatusCodes.OK, "Product approved", data);
  };

  reject = async (req: Request, res: Response): Promise<void> => {
    const data = await this.productService.setApprovalStatus(String(req.params.productId), ProductStatus.REJECTED);
    sendResponse(res, StatusCodes.OK, "Product rejected", data);
  };

  uploadImage = async (req: Request, res: Response): Promise<void> => {
    if (!req.file?.buffer) {
      sendResponse(res, StatusCodes.BAD_REQUEST, "Product image is required");
      return;
    }
    const data = await this.productService.uploadImage(String(req.params.productId), req.file.buffer);
    sendResponse(res, StatusCodes.OK, "Product image uploaded", data);
  };
}
