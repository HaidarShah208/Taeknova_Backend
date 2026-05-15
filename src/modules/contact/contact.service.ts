import { StatusCodes } from "http-status-codes";
import { ApiError } from "@common/exceptions/ApiError";
import { EmailService, isSmtpTransportConfigured } from "@common/services/email.service";
import { env } from "@config/env";

export class ContactService {
  constructor(private readonly emailService = new EmailService()) {}

  async submitContactForm(input: {
    fullName: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }): Promise<{ message: string }> {
    if (!env.ADMIN_EMAIL || !isSmtpTransportConfigured()) {
      throw new ApiError(
        StatusCodes.SERVICE_UNAVAILABLE,
        "Contact form is not available. Please email us directly or try again later.",
      );
    }

    try {
      await this.emailService.sendAdminContactFormNotification({
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        subject: input.subject,
        message: input.message,
      });
    } catch (err) {
      console.error("[contact] Failed to send admin notification", err);
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Could not send your message. Please try again later.",
      );
    }

    return {
      message: "Your message has been sent. We will reply soon.",
    };
  }
}
