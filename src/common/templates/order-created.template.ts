import type { Order } from "@modules/orders/order.entity";
import type { OrderItem } from "@modules/orders/orderItem.entity";
import type { User } from "@modules/users/user.entity";

export type OrderWithDetails = Order & { user: User; items: OrderItem[] };

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function str(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function formatMoney(amount: string, currency: string): string {
  const n = Number(amount);
  if (!Number.isFinite(n)) return `${amount} ${currency}`;
  return `${currency} ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatAddressLines(snapshot: Record<string, unknown>): string[] {
  const lines: string[] = [];
  const label = str(snapshot.label);
  if (label) lines.push(label);
  const recipient = str(snapshot.recipientName);
  if (recipient) lines.push(recipient);
  const phone = str(snapshot.phone);
  if (phone) lines.push(phone);
  const line1 = str(snapshot.line1);
  if (line1) lines.push(line1);
  const line2 = str(snapshot.line2);
  if (line2) lines.push(line2);
  const cityState = [str(snapshot.city), str(snapshot.state)].filter(Boolean).join(", ");
  const postal = str(snapshot.postalCode);
  const tail = [cityState, postal].filter(Boolean).join(" ");
  if (tail) lines.push(tail);
  const country = str(snapshot.country);
  if (country) lines.push(country);
  return lines.length ? lines : ["—"];
}

function formatOrderDate(createdAt: Date): string {
  return createdAt.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function buildAdminOrderCreatedEmail(order: OrderWithDetails): {
  subject: string;
  html: string;
  text: string;
} {
  const reference = order.reference ?? order.id;
  const subject = `New order ${reference}`;

  const customerName = escapeHtml(order.user.fullName);
  const customerEmail = escapeHtml(order.user.email);
  const orderId = escapeHtml(order.id);
  const ref = escapeHtml(reference);
  const currency = escapeHtml(order.currency);
  const payment = escapeHtml(order.paymentMethod ?? "—");
  const orderDate = escapeHtml(formatOrderDate(order.createdAt));
  const notes = order.customerNotes?.trim()
    ? escapeHtml(order.customerNotes.trim())
    : "";

  const addressLines = formatAddressLines(order.shippingAddressSnapshot ?? {});
  const addressHtml = addressLines.map((l) => `<div style="margin:0 0 4px 0;">${escapeHtml(l)}</div>`).join("");

  const cod = Number(order.codFeeAmount ?? 0);
  const codRow =
    cod > 0
      ? `<tr>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;">COD fee</td>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;text-align:right;">${escapeHtml(formatMoney(order.codFeeAmount, order.currency))}</td>
        </tr>`
      : "";

  const rows = order.items
    .map(
      (item) => `<tr>
      <td style="padding:10px 12px;border:1px solid #e5e7eb;vertical-align:top;">
        <div style="font-weight:600;color:#111827;">${escapeHtml(item.productName)}</div>
        <div style="font-size:12px;color:#6b7280;margin-top:4px;">SKU ${escapeHtml(item.sku)} · ${escapeHtml(item.variantLabel)}</div>
      </td>
      <td style="padding:10px 12px;border:1px solid #e5e7eb;text-align:center;width:72px;">${item.quantity}</td>
      <td style="padding:10px 12px;border:1px solid #e5e7eb;text-align:right;white-space:nowrap;">${escapeHtml(formatMoney(item.unitPrice, order.currency))}</td>
      <td style="padding:10px 12px;border:1px solid #e5e7eb;text-align:right;white-space:nowrap;">${escapeHtml(formatMoney(item.lineTotal, order.currency))}</td>
    </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:20px 24px;background:#111827;color:#ffffff;">
                <div style="font-size:14px;opacity:0.9;">New customer order</div>
                <div style="font-size:22px;font-weight:700;margin-top:6px;">${ref}</div>
                <div style="font-size:13px;opacity:0.85;margin-top:6px;">Placed ${orderDate}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:16px;">
                  <tr>
                    <td style="width:50%;vertical-align:top;padding-right:8px;">
                      <div style="font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;">Customer</div>
                      <div style="font-size:15px;font-weight:600;color:#111827;margin-top:6px;">${customerName}</div>
                      <div style="font-size:14px;color:#374151;margin-top:4px;"><a href="mailto:${customerEmail}" style="color:#2563eb;text-decoration:none;">${customerEmail}</a></div>
                    </td>
                    <td style="width:50%;vertical-align:top;padding-left:8px;">
                      <div style="font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;">Order id</div>
                      <div style="font-size:13px;font-family:ui-monospace,Menlo,Consolas,monospace;color:#111827;margin-top:6px;word-break:break-all;">${orderId}</div>
                      <div style="font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;margin-top:12px;">Payment</div>
                      <div style="font-size:14px;color:#111827;margin-top:6px;">${payment}</div>
                    </td>
                  </tr>
                </table>

                <div style="font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:8px;">Shipping address</div>
                <div style="font-size:14px;color:#111827;line-height:1.5;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px 14px;">
                  ${addressHtml}
                </div>

                <div style="font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;margin:20px 0 8px 0;">Line items</div>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-size:14px;color:#111827;">
                  <thead>
                    <tr style="background:#f9fafb;">
                      <th align="left" style="padding:10px 12px;border:1px solid #e5e7eb;font-size:12px;color:#6b7280;">Product</th>
                      <th style="padding:10px 12px;border:1px solid #e5e7eb;font-size:12px;color:#6b7280;">Qty</th>
                      <th align="right" style="padding:10px 12px;border:1px solid #e5e7eb;font-size:12px;color:#6b7280;">Unit</th>
                      <th align="right" style="padding:10px 12px;border:1px solid #e5e7eb;font-size:12px;color:#6b7280;">Line</th>
                    </tr>
                  </thead>
                  <tbody>${rows}</tbody>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-top:12px;max-width:320px;margin-left:auto;font-size:14px;">
                  <tr>
                    <td style="padding:8px 12px;border:1px solid #e5e7eb;">Subtotal</td>
                    <td style="padding:8px 12px;border:1px solid #e5e7eb;text-align:right;">${escapeHtml(formatMoney(order.subtotalAmount, order.currency))}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 12px;border:1px solid #e5e7eb;">Shipping</td>
                    <td style="padding:8px 12px;border:1px solid #e5e7eb;text-align:right;">${escapeHtml(formatMoney(order.shippingAmount, order.currency))}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 12px;border:1px solid #e5e7eb;">Tax</td>
                    <td style="padding:8px 12px;border:1px solid #e5e7eb;text-align:right;">${escapeHtml(formatMoney(order.taxAmount, order.currency))}</td>
                  </tr>
                  ${codRow}
                  <tr>
                    <td style="padding:10px 12px;border:1px solid #e5e7eb;font-weight:700;">Total</td>
                    <td style="padding:10px 12px;border:1px solid #e5e7eb;text-align:right;font-weight:700;">${escapeHtml(formatMoney(order.totalAmount, order.currency))}</td>
                  </tr>
                </table>

                ${
                  notes
                    ? `<div style="margin-top:16px;font-size:13px;color:#374151;"><span style="font-weight:600;">Customer notes:</span><br/>${notes}</div>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="padding:14px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;">
                This message was sent automatically when an order was placed in your store.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const textLines = [
    `New order ${reference}`,
    `Placed: ${formatOrderDate(order.createdAt)}`,
    "",
    `Order id: ${order.id}`,
    `Customer: ${order.user.fullName}`,
    `Email: ${order.user.email}`,
    `Payment: ${order.paymentMethod ?? "—"}`,
    "",
    "Shipping address:",
    ...addressLines.map((l) => `  ${l}`),
    "",
    "Items:",
    ...order.items.map(
      (item) =>
        `  - ${item.productName} (${item.sku}, ${item.variantLabel}) x${item.quantity} @ ${formatMoney(item.unitPrice, order.currency)} = ${formatMoney(item.lineTotal, order.currency)}`,
    ),
    "",
    `Subtotal: ${formatMoney(order.subtotalAmount, order.currency)}`,
    `Shipping: ${formatMoney(order.shippingAmount, order.currency)}`,
    `Tax: ${formatMoney(order.taxAmount, order.currency)}`,
    ...(cod > 0 ? [`COD fee: ${formatMoney(order.codFeeAmount, order.currency)}`] : []),
    `Total: ${formatMoney(order.totalAmount, order.currency)}`,
    ...(order.customerNotes?.trim() ? ["", `Notes: ${order.customerNotes.trim()}`] : []),
  ];

  return { subject, html, text: textLines.join("\n") };
}
