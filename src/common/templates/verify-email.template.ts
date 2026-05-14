function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildVerifyEmailContent(params: {
  fullName: string;
  verifyUrl: string;
}): { subject: string; html: string; text: string } {
  const name = escapeHtml(params.fullName.trim() || "there");
  const url = escapeHtml(params.verifyUrl);
  const subject = "Confirm your email address";

  const html = `<!DOCTYPE html>
<html lang="en">
  <head><meta charset="utf-8" /></head>
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
            <tr>
              <td style="padding:24px 28px;">
                <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#111827;">Confirm your account</p>
                <p style="margin:0 0 20px 0;font-size:14px;line-height:1.6;color:#4b5563;">Hi ${name},</p>
                <p style="margin:0 0 24px 0;font-size:14px;line-height:1.6;color:#4b5563;">
                  Thanks for signing up. Please confirm your email address so you can sign in to your account.
                </p>
                <a href="${url}" style="display:inline-block;padding:12px 22px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
                  Confirm email
                </a>
                <p style="margin:24px 0 0 0;font-size:12px;line-height:1.5;color:#9ca3af;">
                  If the button does not work, copy and paste this link into your browser:<br />
                  <span style="word-break:break-all;color:#6b7280;">${url}</span>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    subject,
    "",
    `Hi ${params.fullName.trim() || "there"},`,
    "",
    "Confirm your account by opening this link:",
    params.verifyUrl,
    "",
    "If you did not create an account, you can ignore this email.",
  ].join("\n");

  return { subject, html, text };
}
