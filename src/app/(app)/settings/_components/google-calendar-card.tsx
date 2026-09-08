"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";

import { disconnectGoogleCalendar } from "../actions";

export function GoogleCalendarCard({ connected }: { connected: boolean }) {
  const [isPending, startTransition] = useTransition();

  if (!connected) {
    return (
      <div className="flex items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm">
          Push your assignments and exams to Google Calendar, and see your
          Google events on your Academique calendar.
        </p>
        <Button
          nativeButton={false}
          render={<a href="/api/integrations/google-calendar/connect">Connect</a>}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm">
        <span className="font-medium text-emerald-600 dark:text-emerald-400">
          Connected
        </span>{" "}
        — assignments and exams sync to your Google Calendar automatically.
      </p>
      <Button
        variant="outline"
        disabled={isPending}
        onClick={() => startTransition(() => disconnectGoogleCalendar())}
      >
        {isPending ? "Disconnecting…" : "Disconnect"}
      </Button>
    </div>
  );
}
