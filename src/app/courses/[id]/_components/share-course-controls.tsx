"use client";

import { Check, Copy, RefreshCw } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { disableCourseShare, enableCourseShare, regenerateCourseShare } from "../actions";

export function ShareCourseControls({
  courseId,
  shareUrl,
}: {
  courseId: string;
  shareUrl: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  if (!shareUrl) {
    return (
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        onClick={() => startTransition(() => enableCourseShare(courseId))}
      >
        {isPending ? "Creating…" : "Create share link"}
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input value={shareUrl} readOnly className="font-mono text-xs" />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Copy link"
          onClick={() => {
            navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? <Check /> : <Copy />}
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => startTransition(() => regenerateCourseShare(courseId))}
        >
          <RefreshCw />
          Regenerate link
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={() => startTransition(() => disableCourseShare(courseId))}
        >
          Turn off sharing
        </Button>
      </div>
    </div>
  );
}
