import { NextFunction, Request, Response } from "express";
import { z } from "zod";

type ValidationSchema = {
  body?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
} | z.ZodTypeAny;

/**
 * Express 5 defines `req.query` (and often `req.params`) as getter-only on the prototype.
 * Assigning `req.query = parsed` throws. Shadow with an own data property so Zod-coerced
 * values are visible to controllers.
 */
function defineRequestField(req: Request, key: "query" | "params", value: unknown): void {
  Object.defineProperty(req, key, {
    value,
    writable: true,
    enumerable: true,
    configurable: true,
  });
}

export function validate(schema: ValidationSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if ("safeParse" in schema) {
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      }) as { body?: unknown; params?: unknown; query?: unknown };
      if (parsed.body !== undefined) req.body = parsed.body as Request["body"];
      if (parsed.params !== undefined) defineRequestField(req, "params", parsed.params);
      if (parsed.query !== undefined) defineRequestField(req, "query", parsed.query);
      next();
      return;
    }

    if (schema.body) req.body = schema.body.parse(req.body) as Request["body"];
    if (schema.params) defineRequestField(req, "params", schema.params.parse(req.params));
    if (schema.query) defineRequestField(req, "query", schema.query.parse(req.query));
    next();
  };
}
