import { Router } from "express";
import { UserRole } from "@common/constants/roles";
import { authGuard } from "@common/guards/authGuard";
import { roleGuard } from "@common/guards/roleGuard";
import { validate } from "@common/middleware/validate";
import { asyncHandler } from "@common/utils/asyncHandler";
import { InventoryController } from "@modules/inventory/inventory.controller";
import { inventoryProductParamSchema, updateStockSchema } from "@modules/inventory/inventory.schema";

const inventoryController = new InventoryController();
export const inventoryRouter = Router();

inventoryRouter.use(authGuard, roleGuard(UserRole.ADMIN));
inventoryRouter.patch("/stock", validate(updateStockSchema), asyncHandler(inventoryController.updateStock));
inventoryRouter.get(
  "/:productId/logs",
  validate(inventoryProductParamSchema),
  asyncHandler(inventoryController.listLogs),
);
