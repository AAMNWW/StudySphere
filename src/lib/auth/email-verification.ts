import crypto from "node:crypto";

import { getMailTransporter, REMINDER_FROM_ADDRESS } from "@/lib/email/client";
import { buildVerificationEmail } from "@/lib/email/verification";
import { db } from "@/lib/db";
import { getSiteUrl } from "@/lib/site-url";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

/** Issues a fresh verification token for `userId` (invalidating any prior
 * unused one, same pattern as PasswordResetToken) and emails the link.
 * Shared by signup and the "resend verification email" action. */
export async function issueAndSendVerificationEmail(
  userId: string,
  email: string,
): Promise<void> {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  await db.$transaction([
    db.emailVerificationToken.deleteMany({ where: { userId } }),
    db.emailVerificationToken.create({
      data: { userId, tokenHash, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
    }),
  ]);

  const verifyUrl = `${getSiteUrl()}/api/auth/verify-email?token=${rawToken}`;
  const built = buildVerificationEmail(verifyUrl);

  const transporter = getMailTransporter();
  await transporter.sendMail({
    from: REMINDER_FROM_ADDRESS,
    to: email,
    subject: built.subject,
    html: built.html,
    text: built.text,
  });
}
