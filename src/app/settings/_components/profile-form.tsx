"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { updateProfile } from "../actions";
import { initialProfileFormState } from "../settings-form-state";

export function ProfileForm({ name }: { name: string | null }) {
  const [state, formAction, isPending] = useActionState(updateProfile, {
    ...initialProfileFormState,
    values: { name: name ?? "" },
  });

  return (
    <form
      // Remounting on each submission lets the input pick up `defaultValue`
      // again after a validation error.
      key={state.submission}
      action={formAction}
      className="space-y-4"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={state.values?.name}
          maxLength={100}
          aria-invalid={Boolean(state.errors?.name)}
        />
        {state.errors?.name ? (
          <p className="text-destructive text-sm">{state.errors.name[0]}</p>
        ) : null}
      </div>

      {state.status === "success" ? (
        <p role="status" className="text-sm text-emerald-600">
          Saved.
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
