import { z } from "zod";

/**
 * Shared validation rules for authentication input. Login intentionally
 * skips the strength rules below — those only make sense when a password is
 * being set, not when it's being checked against what's already stored.
 */

/** Lowercased so "User@Example.com" and "user@example.com" are the same
 * account everywhere an email is looked up or stored — the unique
 * constraint on User.email is case-sensitive at the database level, so
 * this normalization has to happen in application code. */
export const emailSchema = z.email("Enter a valid email address.").trim().toLowerCase();

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});

/** Strength rules applied anywhere a new password is being set — signup and
 * reset-password alike. */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .regex(/[a-zA-Z]/, "Password must contain at least one letter.")
  .regex(/[0-9]/, "Password must contain at least one number.");

export const signupSchema = z.object({
  name: z.string().trim().max(100, "Name must be 100 characters or fewer."),
  email: emailSchema,
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

/** For a signed-in student changing their password from /settings, as
 * opposed to resetPasswordSchema which is for someone who's locked out and
 * proved ownership via an emailed link instead. */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match.",
    path: ["confirmNewPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
