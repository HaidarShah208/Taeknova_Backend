import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "@common/helpers/apiResponse";
import { ContactService } from "@modules/contact/contact.service";

export class ContactController {
  constructor(private readonly contactService = new ContactService()) {}

  submit = async (req: Request, res: Response): Promise<void> => {
    const { fullName, email, phone, subject, message } = req.body as {
      fullName: string;
      email: string;
      phone?: string;
      subject: string;
      message: string;
    };

    const data = await this.contactService.submitContactForm({
      fullName,
      email,
      phone: phone?.trim() || undefined,
      subject,
      message,
    });

    sendResponse(res, StatusCodes.OK, data.message, { sent: true });
  };
}
