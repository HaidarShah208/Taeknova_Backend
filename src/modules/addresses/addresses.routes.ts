import { Router } from "express";
import { authGuard } from "@common/guards/authGuard";
import { asyncHandler } from "@common/utils/asyncHandler";
import { validate } from "@common/middleware/validate";
import { AddressesController } from "@modules/addresses/addresses.controller";
import { addressCreateSchema, addressIdParamSchema, addressUpdateSchema } from "@modules/addresses/addresses.schema";

const addressesController = new AddressesController();
export const addressesRouter = Router();

addressesRouter.use(authGuard);
addressesRouter.get("/", asyncHandler(addressesController.list));
addressesRouter.post("/", validate(addressCreateSchema), asyncHandler(addressesController.create));
addressesRouter.patch("/:addressId", validate(addressUpdateSchema), asyncHandler(addressesController.update));
addressesRouter.delete("/:addressId", validate(addressIdParamSchema), asyncHandler(addressesController.remove));
