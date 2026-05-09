import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "@common/helpers/apiResponse";
import { InventoryService } from "@modules/inventory/inventory.service";

export class InventoryController {
  constructor(private readonly inventoryService = new InventoryService()) {}

  updateStock = async (req: Request, res: Response): Promise<void> => {
    const data = await this.inventoryService.updateStock(req.body);
    sendResponse(res, StatusCodes.OK, "Stock updated", data);
  };

  listLogs = async (req: Request, res: Response): Promise<void> => {
    const data = await this.inventoryService.listLogs(String(req.params.productId));
    sendResponse(res, StatusCodes.OK, "Inventory logs fetched", data);
  };
}
