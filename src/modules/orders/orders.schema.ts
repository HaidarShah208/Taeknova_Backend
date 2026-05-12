import { z } from "zod";
import { CheckoutPaymentMethod } from "@modules/orders/order.types";

export const orderCreateSchema = z
  .object({
    body: z.object({
      addressId: z.string().uuid(),
      shippingMethod: z.string().max(120).optional(),
      customerNotes: z.string().max(2000).optional(),
      paymentMethod: z.nativeEnum(CheckoutPaymentMethod),
      paymentProofUrl: z.string().url().max(2000).optional().nullable(),
    }),
  })
  .superRefine((val, ctx) => {
    if (val.body.paymentMethod === CheckoutPaymentMethod.COD) return;
    if (!val.body.paymentProofUrl?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Payment proof URL is required for manual payments",
        path: ["body", "paymentProofUrl"],
      });
    }
  });

export const orderListQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const orderIdParamSchema = z.object({
  params: z.object({
    orderId: z.string().uuid(),
  }),
});
