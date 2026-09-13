"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";

import { disconnectGoogleCalendar } from "../actions";

export function GoogleCalendarCard({
  connected,
  configured,
}: {
  connected: boolean;
  /** Whether this deployment has Google OAuth credentials at all (see
   * src/lib/google-oauth.ts). Without them the Connect button can only lead
   * to Google's "invalid_client" error, so say so instead of offering it. */
  configured: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  if (!configured && !connected) {
    return (
      <p className="text-muted-foreground text-sm">
        Google Calendar sync isn&apos;t set up on this server yet — no Google
        OAuth credentials are configured.
      </p>
    );
  }

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
