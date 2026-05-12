import { z } from "zod";

export const checkoutSummarySchema = z.object({
  body: z
    .object({
      fromCart: z.boolean().optional(),
      lines: z.array(z.object({ variantId: z.string().uuid(), quantity: z.coerce.number().int().min(1) })).optional(),
    })
    .refine((b) => b.fromCart === true || (Array.isArray(b.lines) && b.lines.length > 0), {
      message: "Provide fromCart: true or a non-empty lines array",
    }),
});
