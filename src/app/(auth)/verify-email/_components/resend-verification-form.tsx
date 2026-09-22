"use client";

import { useActionState } from "react";

import {
  AUTH_BUTTON_CLASS,
  AUTH_FIELD_CLASS,
} from "@/components/auth-split-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { resendVerificationEmail } from "../resend-action";

const initialState = { status: "idle" as const };

export function ResendVerificationForm({ defaultEmail }: { defaultEmail?: string }) {
  const [state, formAction, isPending] = useActionState(
    resendVerificationEmail,
    initialState,
  );

  if (state.status === "success") {
    return (
      <p role="status" className="text-sm">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          className={AUTH_FIELD_CLASS}
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          defaultValue={defaultEmail}
        />
      </div>

      {state.status === "error" ? (
        <p role="alert" className="text-destructive text-sm">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending} className={AUTH_BUTTON_CLASS}>
        {isPending ? "Sending…" : "Resend verification email"}
      </Button>
    </form>
  );
}
