import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "@common/utils/asyncHandler";
import { validate } from "@common/middleware/validate";
import { PublicOgController } from "@modules/public/publicOg.controller";

const ogProductSlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1).max(200),
  }),
});

const controller = new PublicOgController();

export const publicRouter = Router();

publicRouter.get("/og/product/:slug", validate(ogProductSlugSchema), asyncHandler(controller.productOgPage));
