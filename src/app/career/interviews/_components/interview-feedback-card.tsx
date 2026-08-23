"use client";

import { Sparkles } from "lucide-react";
import { useActionState } from "react";

import { IconTile } from "@/components/icon-tile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { retryInterviewFeedback } from "../actions";
import { initialAiActionFormState } from "../interview-form-state";

export function InterviewFeedbackCard({
  sessionId,
  feedback,
  feedbackError,
}: {
  sessionId: string;
  feedback: string | null;
  feedbackError: string | null;
}) {
  const [, formAction, isPending] = useActionState(
    retryInterviewFeedback.bind(null, sessionId),
    initialAiActionFormState,
  );

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-3">
          <IconTile color="green" size="sm">
            <Sparkles className="size-4" />
          </IconTile>
          <CardTitle>Feedback</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {feedback ? (
          <p className="text-sm whitespace-pre-wrap">{feedback}</p>
        ) : null}

        {feedbackError ? (
          <div className="space-y-3">
            <p role="alert" className="text-destructive text-sm">
              {feedbackError}
            </p>
            <form action={formAction}>
              <Button type="submit" variant="outline" size="sm" disabled={isPending}>
                {isPending ? "Retrying…" : "Retry"}
              </Button>
            </form>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
