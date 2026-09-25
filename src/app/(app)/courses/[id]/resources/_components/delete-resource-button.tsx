"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";

import { deleteResource } from "../actions";

export function DeleteResourceButton({
  courseId,
  resourceId,
  title,
}: {
  courseId: string;
  resourceId: string;
  title: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      disabled={isPending}
      aria-label={`Delete ${title}`}
      onClick={() => startTransition(() => deleteResource(courseId, resourceId))}
    >
      <Trash2 />
    </Button>
  );
}
