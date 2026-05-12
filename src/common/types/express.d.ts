import { UserRole } from "@common/constants/roles";
import type { PaginationQuery } from "@common/middleware/pagination";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
      };
      pagination?: PaginationQuery;
    }
  }
}

export {};
