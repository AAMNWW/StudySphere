"use client";

import { Clock4, Square } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { endStudySession, startStudySession } from "../study-session-actions";

function formatElapsed(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

export function StudyTimer({
  courseId,
  activeSession,
}: {
  courseId: string;
  activeSession: { id: string; startedAt: string } | null;
}) {
  const [session, setSession] = useState(activeSession);
  const [now, setNow] = useState(() => Date.now());
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [session]);

  const elapsedMs = session ? now - new Date(session.startedAt).getTime() : 0;

  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
          <Clock4 className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">
            {session ? "Studying now" : "Not studying right now"}
          </p>
          <p className="text-muted-foreground text-xs tabular-nums">
            {session ? formatElapsed(elapsedMs) : "Track how long you spend on this course"}
          </p>
        </div>
        {session ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => {
              const current = session;
              setSession(null);
              startTransition(() => {
                endStudySession(courseId, current.id);
              });
            }}
          >
            <Square />
            Stop
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const started = await startStudySession(courseId);
                setSession(started);
                setNow(Date.now());
              });
            }}
          >
            Start studying
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
