import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

import { env } from "@config/env";
import type { Order } from "@modules/orders/order.entity";
import type { OrderItem } from "@modules/orders/orderItem.entity";
import type { User } from "@modules/users/user.entity";

import { buildAdminOrderCreatedEmail } from "@common/templates/order-created.template";
import { buildVerifyEmailContent } from "@common/templates/verify-email.template";

type OrderWithNotifyRelations = Order & { user: User; items: OrderItem[] };

/** Enough to send mail to end users (verification, receipts, etc.). */
export function isSmtpTransportConfigured(): boolean {
  return Boolean(
    env.MAIL_HOST && env.MAIL_PORT !== undefined && env.MAIL_USER && env.MAIL_PASS,
  );
}

function isAdminOrderMailConfigured(): boolean {
  return isSmtpTransportConfigured() && Boolean(env.ADMIN_EMAIL);
}

/**
 * Central SMTP transport. Lazily created so the process can boot without mail in dev.
 */
export class EmailService {
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter | null {
    if (!isSmtpTransportConfigured()) return null;
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
      console.warn("[email] sendEmail skipped: MAIL_HOST / MAIL_PORT / MAIL_USER / MAIL_PASS not fully configured");
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

  async sendVerifyEmailAddress(params: { to: string; fullName: string; verifyUrl: string }): Promise<void> {
    const { subject, html, text } = buildVerifyEmailContent({
      fullName: params.fullName,
      verifyUrl: params.verifyUrl,
    });
    await this.sendEmail({ to: params.to, subject, html, text });
  }

  /** Admin alert when a customer order is placed (HTML + plain text). */
  async sendAdminOrderCreatedNotification(order: Order): Promise<void> {
    if (!isAdminOrderMailConfigured()) {
      console.warn("[email] Order admin email skipped: set ADMIN_EMAIL and full SMTP credentials");
      return;
    }

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
