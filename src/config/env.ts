import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),
  APP_ORIGIN: z.string().url(),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  /** `strict` is strictest; use `lax` when dev SPA and API run on different ports (same-site cookies). */
  COOKIE_SAMESITE: z.enum(["strict", "lax", "none"]).default("lax"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  /** SMTP (optional). When any are missing, outbound email is skipped. */
  MAIL_HOST: z.string().min(1).optional(),
  MAIL_PORT: z.coerce.number().int().min(1).max(65535).optional(),
  MAIL_USER: z.string().min(1).optional(),
  MAIL_PASS: z.string().min(1).optional(),
  /** Recipient for transactional alerts (e.g. new order). */
  ADMIN_EMAIL: z.string().email().optional(),
  /** From header; defaults to MAIL_USER. May be `"Store Name" <noreply@example.com>`. */
  MAIL_FROM: z.string().min(1).optional(),
  /** Force TLS. Defaults to true when MAIL_PORT is 465. */
  MAIL_SECURE: z.coerce.boolean().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
  throw new Error(`Invalid environment configuration:\n${issues.join("\n")}`);
}

export const env = parsed.data;
