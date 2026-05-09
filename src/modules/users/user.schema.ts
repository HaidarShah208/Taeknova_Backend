import { z } from "zod";
import { UserRole } from "@common/constants/roles";

export const createAdminSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(120),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.nativeEnum(UserRole).default(UserRole.ADMIN),
  }),
});
