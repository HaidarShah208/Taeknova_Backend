import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Express } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "@config/env";
import { errorHandler } from "@common/filters/errorHandler";
import { notFound } from "@common/middleware/notFound";
import { apiRouter } from "@routes/index";

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.APP_ORIGIN,
      credentials: true,
    }),
  );
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 500,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  app.get("/health", (_req, res) => {
    res.status(200).json({ success: true, message: "Service healthy" });
  });

  app.use("/api/v1", apiRouter);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
