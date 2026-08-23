export interface PasswordResetEmail {
  subject: string;
  html: string;
  text: string;
}

/** Builds the "reset your password" email. `resetUrl` already has the raw
 * token in it (see src/app/(auth)/forgot-password/actions.ts) — this file
 * only formats the message, it never sees the token's hash or handles
 * matching it back to a user. */
export function buildPasswordResetEmail(resetUrl: string): PasswordResetEmail {
  const subject = "Reset your StudySphere AI password";

  const text =
    `Someone (hopefully you) asked to reset your StudySphere AI password.\n\n` +
    `Reset it here: ${resetUrl}\n\n` +
    `This link expires in 1 hour. If you didn't request this, you can ` +
    `safely ignore this email — your password won't change.\n\n` +
    `— StudySphere AI`;

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
      <p style="color:#111827;">Someone (hopefully you) asked to reset your StudySphere AI password.</p>
      <p style="margin:24px 0;">
        <a href="${resetUrl}" style="background:#111827;color:#fff;padding:10px 20px;border-radius:9999px;text-decoration:none;display:inline-block;">
          Reset password
        </a>
      </p>
      <p style="color:#6b7280;font-size:13px;">
        This link expires in 1 hour. If you didn't request this, you can safely
        ignore this email — your password won't change.
      </p>
      <p style="margin-top:24px;color:#9ca3af;font-size:13px;">— StudySphere AI</p>
    </div>`;

  return { subject, html, text };
}
