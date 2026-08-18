"use server";

import { CredentialsSignin } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";

import { signIn } from "@/auth";
import { loginSchema } from "@/lib/validations/auth";

import type { LoginFormState } from "./login-form-state";

export async function login(
  previousState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const submission = previousState.submission + 1;

  const values = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    return {
      submission,
      status: "error",
      errors: z.flattenError(parsed.error).fieldErrors,
      values: { email: values.email },
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof CredentialsSignin) {
      return {
        submission,
        status: "error",
        message: "Invalid email or password.",
        values: { email: values.email },
      };
    }
    throw error;
  }

  redirect("/courses");
}
