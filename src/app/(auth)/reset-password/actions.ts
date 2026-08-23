"use server";

import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";

import { signIn } from "@/auth";
import { db } from "@/lib/db";
import { resetPasswordSchema } from "@/lib/validations/auth";

import type { ResetPasswordFormState } from "./reset-password-form-state";

export async function resetPassword(
  token: string,
  previousState: ResetPasswordFormState,
  formData: FormData,
): Promise<ResetPasswordFormState> {
  const submission = previousState.submission + 1;

  const values = {
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };

  const parsed = resetPasswordSchema.safeParse(values);

  if (!parsed.success) {
    return {
      submission,
      status: "error",
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const resetToken = await db.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, email: true } } },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return {
      submission,
      status: "error",
      message: "This link is invalid or has expired. Request a new one.",
    };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

  await db.$transaction([
    db.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    }),
    db.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  // The student just proved ownership of the account by clicking a link
  // only they received by email — sign them straight in rather than
  // bouncing them to /login to type the password they just set.
  await signIn("credentials", {
    email: resetToken.user.email,
    password: parsed.data.password,
    redirect: false,
  });

  redirect("/");
}
