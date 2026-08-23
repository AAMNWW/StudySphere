"use server";

import crypto from "node:crypto";
import { z } from "zod";

import { getMailTransporter, REMINDER_FROM_ADDRESS } from "@/lib/email/client";
import { buildPasswordResetEmail } from "@/lib/email/password-reset";
import { db } from "@/lib/db";
import { getSiteUrl } from "@/lib/site-url";
import { forgotPasswordSchema } from "@/lib/validations/auth";

import type { ForgotPasswordFormState } from "./forgot-password-form-state";

const TOKEN_TTL_MS = 60 * 60 * 1000;

export async function requestPasswordReset(
  previousState: ForgotPasswordFormState,
  formData: FormData,
): Promise<ForgotPasswordFormState> {
  const submission = previousState.submission + 1;

  const values = { email: String(formData.get("email") ?? "") };
  const parsed = forgotPasswordSchema.safeParse(values);

  if (!parsed.success) {
    return {
      submission,
      status: "error",
      errors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  // Same response whether or not the account exists — a different message
  // here would let anyone probe which emails have accounts.
  const genericSuccess: ForgotPasswordFormState = {
    submission,
    status: "success",
    message: "If an account exists for that email, we've sent a reset link.",
  };

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (!user) {
    return genericSuccess;
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  await db.$transaction([
    // A student who requests multiple resets should only have the latest
    // link work — stale ones lying around are just extra attack surface.
    db.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } }),
    db.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
    }),
  ]);

  const resetUrl = `${getSiteUrl()}/reset-password?token=${rawToken}`;
  const email = buildPasswordResetEmail(resetUrl);

  try {
    const transporter = getMailTransporter();
    await transporter.sendMail({
      from: REMINDER_FROM_ADDRESS,
      to: parsed.data.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
  } catch (error) {
    console.error("Failed to send password reset email", error);
    return {
      submission,
      status: "error",
      message: "Could not send the reset email right now. Please try again.",
    };
  }

  return genericSuccess;
}
