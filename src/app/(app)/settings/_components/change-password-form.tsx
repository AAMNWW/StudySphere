"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { changePassword } from "../actions";
import { initialChangePasswordFormState } from "../settings-form-state";

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(
    changePassword,
    initialChangePasswordFormState,
  );

  return (
    <form
      // Remounting on each submission clears the password inputs — unlike
      // ProfileForm, there's no defaultValue worth preserving here.
      key={state.submission}
      action={formAction}
      className="space-y-4"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(state.errors?.currentPassword)}
          aria-describedby={
            state.errors?.currentPassword ? "current-password-error" : undefined
          }
        />
        {state.errors?.currentPassword ? (
          <p id="current-password-error" className="text-destructive text-sm">
            {state.errors.currentPassword[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(state.errors?.newPassword)}
          aria-describedby={
            state.errors?.newPassword ? "new-password-error" : "new-password-hint"
          }
        />
        {state.errors?.newPassword ? (
          <p id="new-password-error" className="text-destructive text-sm">
            {state.errors.newPassword[0]}
          </p>
        ) : (
          <p id="new-password-hint" className="text-muted-foreground text-xs">
            At least 8 characters, with a letter and a number.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmNewPassword">Confirm new password</Label>
        <Input
          id="confirmNewPassword"
          name="confirmNewPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(state.errors?.confirmNewPassword)}
          aria-describedby={
            state.errors?.confirmNewPassword ? "confirm-new-password-error" : undefined
          }
        />
        {state.errors?.confirmNewPassword ? (
          <p id="confirm-new-password-error" className="text-destructive text-sm">
            {state.errors.confirmNewPassword[0]}
          </p>
        ) : null}
      </div>

      {state.status === "success" ? (
        <p role="status" className="text-sm text-emerald-600">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Change password"}
      </Button>
    </form>
  );
}
