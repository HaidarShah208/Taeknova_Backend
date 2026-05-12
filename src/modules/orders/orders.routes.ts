import { Router } from "express";
import { UserRole } from "@common/constants/roles";
import { authGuard } from "@common/guards/authGuard";
import { roleGuard } from "@common/guards/roleGuard";
import { asyncHandler } from "@common/utils/asyncHandler";
import { validate } from "@common/middleware/validate";
import { OrdersController } from "@modules/orders/orders.controller";
import { orderCreateSchema, orderIdParamSchema, orderListQuerySchema } from "@modules/orders/orders.schema";

const ordersController = new OrdersController();
export const ordersRouter = Router();

ordersRouter.use(authGuard);
ordersRouter.get("/", validate(orderListQuerySchema), asyncHandler(ordersController.listMine));
ordersRouter.get(
  "/admin",
  roleGuard(UserRole.ADMIN),
  validate(orderListQuerySchema),
  asyncHandler(ordersController.listAllAdmin),
);
ordersRouter.post("/", validate(orderCreateSchema), asyncHandler(ordersController.create));
ordersRouter.get("/:orderId", validate(orderIdParamSchema), asyncHandler(ordersController.getMine));
ordersRouter.patch("/:orderId/cancel", validate(orderIdParamSchema), asyncHandler(ordersController.cancelMine));
