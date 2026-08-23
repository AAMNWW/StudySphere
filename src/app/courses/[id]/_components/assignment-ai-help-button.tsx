"use client";

import { Sparkles } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { getAssignmentAiHelp } from "../actions";
import { initialAssignmentHelpFormState } from "../assignment-help-form-state";

export function AssignmentAiHelpButton({
  courseId,
  assignmentId,
  hasHelp,
}: {
  courseId: string;
  assignmentId: string;
  hasHelp: boolean;
}) {
  // Errors are persisted on the assignment and rendered by AssignmentCard,
  // so the action's returned state only needs to drive the pending label.
  const [, formAction, isPending] = useActionState(
    getAssignmentAiHelp.bind(null, courseId, assignmentId),
    initialAssignmentHelpFormState,
  );

  return (
    <form action={formAction}>
      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
        <Sparkles />
        {isPending ? "Thinking…" : hasHelp ? "Regenerate help" : "Get AI help starting this"}
      </Button>
    </form>
  );
}
