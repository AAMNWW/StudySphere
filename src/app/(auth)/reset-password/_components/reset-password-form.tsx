"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { resetPassword } from "../actions";
import { initialResetPasswordFormState } from "../reset-password-form-state";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(
    resetPassword.bind(null, token),
    initialResetPasswordFormState,
  );

  return (
    <form
      key={state.submission}
      action={formAction}
      className="space-y-4"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(state.errors?.password)}
          aria-describedby={
            state.errors?.password ? "password-error" : "password-hint"
          }
        />
        {state.errors?.password ? (
          <p id="password-error" className="text-destructive text-sm">
            {state.errors.password[0]}
          </p>
        ) : (
          <p id="password-hint" className="text-muted-foreground text-xs">
            At least 8 characters, with a letter and a number.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(state.errors?.confirmPassword)}
          aria-describedby={
            state.errors?.confirmPassword ? "confirm-password-error" : undefined
          }
        />
        {state.errors?.confirmPassword ? (
          <p id="confirm-password-error" className="text-destructive text-sm">
            {state.errors.confirmPassword[0]}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <p role="alert" className="text-destructive text-sm">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Set new password"}
      </Button>
    </form>
  );
}
