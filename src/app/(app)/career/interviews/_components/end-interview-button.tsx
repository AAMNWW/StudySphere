"use client";

import { Flag } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { endInterviewSession } from "../actions";
import { initialAiActionFormState } from "../interview-form-state";

export function EndInterviewButton({ sessionId }: { sessionId: string }) {
  const [, formAction, isPending] = useActionState(
    endInterviewSession.bind(null, sessionId),
    initialAiActionFormState,
  );

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm("End this interview and get feedback? You won't be able to continue it.")) {
          event.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="outline" disabled={isPending}>
        <Flag />
        {isPending ? "Ending…" : "End interview & get feedback"}
      </Button>
    </form>
  );
}
