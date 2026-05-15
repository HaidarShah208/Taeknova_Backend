import { Router } from "express";
import { asyncHandler } from "@common/utils/asyncHandler";
import { validate } from "@common/middleware/validate";
import { ContactController } from "@modules/contact/contact.controller";
import { contactFormBodySchema } from "@modules/contact/contact.schema";

const contactController = new ContactController();

export const contactRouter = Router();

contactRouter.post("/", validate(contactFormBodySchema), asyncHandler(contactController.submit));
