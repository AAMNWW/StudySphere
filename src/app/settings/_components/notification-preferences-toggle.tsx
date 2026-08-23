"use client";

import { useState, useTransition } from "react";

import { Checkbox } from "@/components/ui/checkbox";

import { updateEmailReminders } from "../actions";

export function NotificationPreferencesToggle({ enabled }: { enabled: boolean }) {
  const [checked, setChecked] = useState(enabled);
  const [isPending, startTransition] = useTransition();

  return (
    <label className="bg-muted/40 flex items-start gap-3 rounded-xl border p-3">
      <Checkbox
        checked={checked}
        disabled={isPending}
        onCheckedChange={(value) => {
          const next = value === true;
          setChecked(next);
          startTransition(() => {
            updateEmailReminders(next);
          });
        }}
        className="mt-0.5"
      />
      <span>
        <span className="text-sm font-medium">Email me when an assignment is due soon</span>
        <span className="text-muted-foreground block text-xs">
          A daily digest, sent at most once a day, for anything due within 48 hours.
        </span>
      </span>
    </label>
  );
}
