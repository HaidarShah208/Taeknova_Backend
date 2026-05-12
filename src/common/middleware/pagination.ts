import type { Request, Response, NextFunction } from "express";

export interface PaginationQuery {
  page: number;
  limit: number;
}

export function parsePaginationFromRequest(req: Request): PaginationQuery {
  const pageRaw = parseInt(String(req.query.page ?? "1"), 10);
  const limitRaw = parseInt(String(req.query.limit ?? "20"), 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const limitUncapped = Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : 20;
  const limit = Math.min(100, limitUncapped);
  return { page, limit };
}

/** Attaches `req.pagination` from `page` and `limit` query params (defaults: 1, 20; max limit 100). */
export function paginationQueryMiddleware(req: Request, _res: Response, next: NextFunction): void {
  req.pagination = parsePaginationFromRequest(req);
  next();
}
