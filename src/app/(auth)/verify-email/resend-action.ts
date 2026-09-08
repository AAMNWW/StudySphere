"use server";

import { z } from "zod";

import { db } from "@/lib/db";
import { issueAndSendVerificationEmail } from "@/lib/auth/email-verification";
import { emailSchema } from "@/lib/validations/auth";

export interface ResendVerificationState {
  status: "idle" | "success" | "error";
  message?: string;
}

const schema = z.object({ email: emailSchema });

/** Shared by the login form's "resend" link and the /verify-email page's
 * manual-entry form. Always returns the same message regardless of whether
 * the account exists or is already verified — same anti-enumeration
 * approach as requestPasswordReset in ../forgot-password/actions.ts. */
export async function resendVerificationEmail(
  _previousState: ResendVerificationState,
  formData: FormData,
): Promise<ResendVerificationState> {
  const parsed = schema.safeParse({ email: String(formData.get("email") ?? "") });

  const genericSuccess: ResendVerificationState = {
    status: "success",
    message: "If that account needs verification, we've sent a new link.",
  };

  if (!parsed.success) {
    return genericSuccess;
  }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, email: true, emailVerified: true },
  });

  if (!user || user.emailVerified) {
    return genericSuccess;
  }

  try {
    await issueAndSendVerificationEmail(user.id, user.email);
  } catch (error) {
    console.error("Failed to resend verification email", error);
    return {
      status: "error",
      message: "Could not send the email right now. Please try again.",
    };
  }

  return genericSuccess;
}
