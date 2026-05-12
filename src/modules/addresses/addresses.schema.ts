import { z } from "zod";

export const addressCreateSchema = z.object({
  body: z.object({
    label: z.string().min(1).max(80),
    recipientName: z.string().min(1).max(120),
    phone: z.string().max(40).optional(),
    line1: z.string().min(1).max(180),
    line2: z.string().max(180).optional(),
    city: z.string().min(1).max(100),
    state: z.string().max(100).optional(),
    postalCode: z.string().min(1).max(24),
    country: z.string().min(1).max(80),
    isDefault: z.boolean().optional(),
  }),
});

export const addressUpdateSchema = z.object({
  params: z.object({
    addressId: z.string().uuid(),
  }),
  body: z
    .object({
      label: z.string().min(1).max(80).optional(),
      recipientName: z.string().min(1).max(120).optional(),
      phone: z.string().max(40).optional(),
      line1: z.string().min(1).max(180).optional(),
      line2: z.string().max(180).optional(),
      city: z.string().min(1).max(100).optional(),
      state: z.string().max(100).optional(),
      postalCode: z.string().min(1).max(24).optional(),
      country: z.string().min(1).max(80).optional(),
      isDefault: z.boolean().optional(),
    })
    .refine((b) => Object.keys(b).length > 0, "At least one field is required"),
});

export const addressIdParamSchema = z.object({
  params: z.object({
    addressId: z.string().uuid(),
  }),
});
