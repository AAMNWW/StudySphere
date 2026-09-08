"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { updateCreditHours } from "../../actions";

export function CreditHoursForm({
  courseId,
  creditHours,
}: {
  courseId: string;
  creditHours: number | null;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(() => {
          updateCreditHours(courseId, formData);
        });
      }}
      className="flex items-end gap-2"
    >
      <div className="space-y-2">
        <Label htmlFor="creditHours">Credit hours</Label>
        <Input
          id="creditHours"
          name="creditHours"
          type="number"
          step="any"
          min="0"
          defaultValue={creditHours ?? ""}
          className="w-32"
        />
      </div>
      <Button type="submit" variant="outline" disabled={isPending}>
        {isPending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
