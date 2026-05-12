import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "@common/helpers/apiResponse";
import { AddressService } from "@modules/addresses/address.service";

export class AddressesController {
  constructor(private readonly addressService = new AddressService()) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const data = await this.addressService.list(req.user!.id);
    sendResponse(res, StatusCodes.OK, "Addresses retrieved", data);
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const data = await this.addressService.create(req.user!.id, req.body);
    sendResponse(res, StatusCodes.CREATED, "Address created", data);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const data = await this.addressService.update(req.user!.id, String(req.params.addressId), req.body);
    sendResponse(res, StatusCodes.OK, "Address updated", data);
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    await this.addressService.remove(req.user!.id, String(req.params.addressId));
    sendResponse(res, StatusCodes.OK, "Address deleted");
  };
}
