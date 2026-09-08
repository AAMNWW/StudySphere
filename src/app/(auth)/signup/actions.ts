"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";

import { issueAndSendVerificationEmail } from "@/lib/auth/email-verification";
import { db } from "@/lib/db";
import { signupSchema } from "@/lib/validations/auth";

import type { SignupFormState } from "./signup-form-state";

export async function signup(
  previousState: SignupFormState,
  formData: FormData,
): Promise<SignupFormState> {
  const submission = previousState.submission + 1;

  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
  const echoValues = { name: values.name, email: values.email };

  const parsed = signupSchema.safeParse(values);

  if (!parsed.success) {
    return {
      submission,
      status: "error",
      errors: z.flattenError(parsed.error).fieldErrors,
      values: echoValues,
    };
  }

  const existing = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (existing) {
    return {
      submission,
      status: "error",
      errors: { email: ["An account with this email already exists."] },
      values: echoValues,
    };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

  let userId: string;

  try {
    const user = await db.user.create({
      data: {
        // Store an absent name as NULL rather than an empty string, so "no
        // name" has exactly one representation in the database.
        name: parsed.data.name || null,
        email: parsed.data.email,
        password: hashedPassword,
      },
      select: { id: true },
    });
    userId = user.id;
  } catch (error) {
    console.error("Failed to create account", error);
    return {
      submission,
      status: "error",
      message: "Could not create your account. Please try again.",
      values: echoValues,
    };
  }

  // Credentials sign-in is blocked until this link is clicked (see
  // authorize() in src/auth.ts) — the account exists but isn't usable yet,
  // so send the student to /signup/check-email instead of signing them in.
  try {
    await issueAndSendVerificationEmail(userId, parsed.data.email);
  } catch (error) {
    console.error("Failed to send verification email", error);
    return {
      submission,
      status: "error",
      message:
        "Your account was created, but we couldn't send the verification email. Try resending it from the verify-email page.",
      values: echoValues,
    };
  }

  redirect("/signup/check-email");
}
