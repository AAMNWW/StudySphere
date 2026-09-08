export interface VerificationEmail {
  subject: string;
  html: string;
  text: string;
}

/** Builds the "confirm your email" email sent on signup. `verifyUrl` already
 * has the raw token in it (see src/lib/auth/email-verification.ts) — this
 * file only formats the message, mirroring src/lib/email/password-reset.ts. */
export function buildVerificationEmail(verifyUrl: string): VerificationEmail {
  const subject = "Confirm your Academique email";

  const text =
    `Welcome to Academique! Confirm your email to finish setting up your account.\n\n` +
    `Confirm it here: ${verifyUrl}\n\n` +
    `This link expires in 24 hours. If you didn't create this account, you ` +
    `can safely ignore this email.\n\n` +
    `— Academique`;

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
      <p style="color:#111827;">Welcome to Academique! Confirm your email to finish setting up your account.</p>
      <p style="margin:24px 0;">
        <a href="${verifyUrl}" style="background:#111827;color:#fff;padding:10px 20px;border-radius:9999px;text-decoration:none;display:inline-block;">
          Confirm email
        </a>
      </p>
      <p style="color:#6b7280;font-size:13px;">
        This link expires in 24 hours. If you didn't create this account, you can safely ignore this email.
      </p>
      <p style="margin-top:24px;color:#9ca3af;font-size:13px;">— Academique</p>
    </div>`;

  return { subject, html, text };
}
