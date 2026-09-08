"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { resendVerificationEmail } from "../../verify-email/resend-action";
import { login } from "../actions";
import { initialLoginFormState } from "../login-form-state";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    login,
    initialLoginFormState,
  );
  const [resendState, resendAction, isResending] = useActionState(
    resendVerificationEmail,
    { status: "idle" as const },
  );

  return (
    <form
      // Remounting on each submission lets the inputs pick up `defaultValue`
      // again after a validation error.
      key={state.submission}
      action={formAction}
      className="space-y-4"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          defaultValue={state.values?.email}
          aria-invalid={Boolean(state.errors?.email)}
          aria-describedby={state.errors?.email ? "email-error" : undefined}
        />
        {state.errors?.email ? (
          <p id="email-error" className="text-destructive text-sm">
            {state.errors.email[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-muted-foreground text-xs underline underline-offset-4"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(state.errors?.password)}
          aria-describedby={
            state.errors?.password ? "password-error" : undefined
          }
        />
        {state.errors?.password ? (
          <p id="password-error" className="text-destructive text-sm">
            {state.errors.password[0]}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <div role="alert" className="space-y-2">
          <p className="text-destructive text-sm">{state.message}</p>
          {state.needsVerification ? (
            resendState.status === "success" ? (
              <p role="status" className="text-muted-foreground text-sm">
                {resendState.message}
              </p>
            ) : (
              <form action={resendAction}>
                <input type="hidden" name="email" value={state.values?.email} />
                <button
                  type="submit"
                  disabled={isResending}
                  className="text-foreground text-sm underline underline-offset-4"
                >
                  {isResending ? "Sending…" : "Resend verification email"}
                </button>
              </form>
            )
          ) : null}
        </div>
      ) : null}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
