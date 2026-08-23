"use client";

import { useState } from "react";

import { JOB_STATUS_OPTIONS } from "@/components/job-status-badge";
import { cn } from "@/lib/utils";

export function JobStatusPicker({
  defaultValue = "SAVED",
}: {
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div role="radiogroup" aria-label="Status" className="flex flex-wrap gap-1.5">
      {JOB_STATUS_OPTIONS.map((option) => (
        <label
          key={option.value}
          className={cn(
            "cursor-pointer rounded-full border px-3 py-1 text-sm font-medium transition-colors",
            value === option.value
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border hover:bg-muted",
          )}
        >
          <input
            type="radio"
            name="status"
            value={option.value}
            checked={value === option.value}
            onChange={() => setValue(option.value)}
            className="sr-only"
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}
