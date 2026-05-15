function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildAdminContactFormEmail(params: {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): { subject: string; html: string; text: string } {
  const fullName = escapeHtml(params.fullName.trim());
  const email = escapeHtml(params.email.trim());
  const phone = params.phone?.trim() ? escapeHtml(params.phone.trim()) : "—";
  const subject = escapeHtml(params.subject.trim());
  const message = escapeHtml(params.message.trim()).replace(/\n/g, "<br />");
  const messageText = params.message.trim();

  const mailSubject = `[Contact] ${params.subject.trim()}`;

  const html = `<!DOCTYPE html>
<html lang="en">
  <head><meta charset="utf-8" /></head>
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:24px 28px;">
                <p style="margin:0 0 8px 0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;">New contact form submission</p>
                <p style="margin:0 0 20px 0;font-size:18px;font-weight:700;color:#111827;">${subject}</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;color:#374151;">
                  <tr><td style="padding:6px 0;font-weight:600;width:100px;">Name</td><td>${fullName}</td></tr>
                  <tr><td style="padding:6px 0;font-weight:600;">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
                  <tr><td style="padding:6px 0;font-weight:600;">Phone</td><td>${phone}</td></tr>
                </table>
                <p style="margin:20px 0 8px 0;font-size:13px;font-weight:600;color:#111827;">Message</p>
                <p style="margin:0;font-size:14px;line-height:1.6;color:#4b5563;">${message}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    "New contact form submission",
    "",
    `Subject: ${params.subject.trim()}`,
    `Name: ${params.fullName.trim()}`,
    `Email: ${params.email.trim()}`,
    `Phone: ${params.phone?.trim() || "—"}`,
    "",
    "Message:",
    messageText,
  ].join("\n");

  return { subject: mailSubject, html, text };
}
