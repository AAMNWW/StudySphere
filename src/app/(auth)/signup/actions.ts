"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";

import { signIn } from "@/auth";
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

  try {
    await db.user.create({
      data: {
        // Store an absent name as NULL rather than an empty string, so "no
        // name" has exactly one representation in the database.
        name: parsed.data.name || null,
        email: parsed.data.email,
        password: hashedPassword,
      },
    });
  } catch (error) {
    console.error("Failed to create account", error);
    return {
      submission,
      status: "error",
      message: "Could not create your account. Please try again.",
      values: echoValues,
    };
  }

  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirect: false,
  });

  redirect("/");
}
