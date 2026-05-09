import { NextFunction, Request, Response } from "express";
import { z } from "zod";

type ValidationSchema = {
  body?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
} | z.ZodTypeAny;

export function validate(schema: ValidationSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if ("safeParse" in schema) {
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      }) as { body?: unknown; params?: unknown; query?: unknown };
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.params !== undefined) req.params = parsed.params as Request["params"];
      if (parsed.query !== undefined) req.query = parsed.query as Request["query"];
      next();
      return;
    }

    if (schema.body) req.body = schema.body.parse(req.body);
    if (schema.params) req.params = schema.params.parse(req.params) as Request["params"];
    if (schema.query) req.query = schema.query.parse(req.query) as Request["query"];
    next();
  };
}
