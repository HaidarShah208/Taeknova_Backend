import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

import { env } from "@config/env";
import type { Order } from "@modules/orders/order.entity";
import type { OrderItem } from "@modules/orders/orderItem.entity";
import type { User } from "@modules/users/user.entity";

import { buildAdminOrderCreatedEmail } from "@common/templates/order-created.template";

type OrderWithNotifyRelations = Order & { user: User; items: OrderItem[] };

function isMailConfigured(): boolean {
  return Boolean(
    env.MAIL_HOST &&
      env.MAIL_PORT !== undefined &&
      env.MAIL_USER &&
      env.MAIL_PASS &&
      env.ADMIN_EMAIL,
  );
}

/**
 * Central SMTP transport. Lazily created so the process can boot without mail in dev.
 */
export class EmailService {
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter | null {
    if (!isMailConfigured()) return null;
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: env.MAIL_HOST,
        port: env.MAIL_PORT,
        secure: env.MAIL_SECURE ?? env.MAIL_PORT === 465,
        auth: {
          user: env.MAIL_USER,
          pass: env.MAIL_PASS,
        },
      });
    }
    return this.transporter;
  }

  /**
   * Low-level send. Throws on SMTP failure — callers decide whether to catch (e.g. post-checkout).
   */
  async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    text: string;
    replyTo?: string;
  }): Promise<void> {
    const transport = this.getTransporter();
    if (!transport) {
      console.warn("[email] sendEmail skipped: MAIL_* / ADMIN_EMAIL not fully configured");
      return;
    }

    const from = env.MAIL_FROM ?? env.MAIL_USER!;

    await transport.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      ...(options.replyTo ? { replyTo: options.replyTo } : {}),
    });
  }

  /** Admin alert when a customer order is placed (HTML + plain text). */
  async sendAdminOrderCreatedNotification(order: Order): Promise<void> {
    const o = order as Partial<OrderWithNotifyRelations>;
    if (!o.user?.email || !o.items?.length) {
      console.warn("[email] Order created email skipped: missing user or items", { orderId: order.id });
      return;
    }

    const { subject, html, text } = buildAdminOrderCreatedEmail(order as OrderWithNotifyRelations);
    await this.sendEmail({
      to: env.ADMIN_EMAIL!,
      subject,
      html,
      text,
      replyTo: o.user.email,
    });
  }
}
