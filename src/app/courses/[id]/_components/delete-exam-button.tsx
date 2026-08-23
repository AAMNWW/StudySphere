"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { deleteExam } from "../actions";

export function DeleteExamButton({
  courseId,
  examId,
  examTitle,
}: {
  courseId: string;
  examId: string;
  examTitle: string;
}) {
  return (
    <form
      action={deleteExam.bind(null, courseId, examId)}
      onSubmit={(event) => {
        if (!window.confirm(`Delete "${examTitle}"? This cannot be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="ghost" size="icon-sm" aria-label={`Delete ${examTitle}`}>
        <Trash2 />
      </Button>
    </form>
  );
}
