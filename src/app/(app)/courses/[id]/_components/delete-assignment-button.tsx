"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { deleteAssignment } from "../actions";

export function DeleteAssignmentButton({
  courseId,
  assignmentId,
  assignmentTitle,
}: {
  courseId: string;
  assignmentId: string;
  assignmentTitle: string;
}) {
  return (
    <form
      action={deleteAssignment.bind(null, courseId, assignmentId)}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Delete "${assignmentTitle}"? This cannot be undone.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <Button
        type="submit"
        variant="ghost"
        size="icon-sm"
        aria-label={`Delete ${assignmentTitle}`}
      >
        <Trash2 />
      </Button>
    </form>
  );
}
