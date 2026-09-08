"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { deleteJobApplication } from "../actions";

export function DeleteJobApplicationButton({
  jobId,
  jobLabel,
}: {
  jobId: string;
  jobLabel: string;
}) {
  return (
    <form
      action={deleteJobApplication.bind(null, jobId)}
      onSubmit={(event) => {
        if (!window.confirm(`Delete "${jobLabel}"? This cannot be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="ghost" size="icon-sm" aria-label={`Delete ${jobLabel}`}>
        <Trash2 />
      </Button>
    </form>
  );
}
