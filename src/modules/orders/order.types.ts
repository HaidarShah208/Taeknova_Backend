export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
  AWAITING = "AWAITING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

/** How the customer chose to pay at checkout (stored on the order). */
export enum CheckoutPaymentMethod {
  COD = "COD",
  EASYPAISA = "EASYPAISA",
  JAZZCASH = "JAZZCASH",
  MEEZAN_BANK = "MEEZAN_BANK",
}
