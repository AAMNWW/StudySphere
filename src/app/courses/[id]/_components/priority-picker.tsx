"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

const PRIORITIES = [
  { value: "LOW", label: "Low", activeClassName: "border-sky-400 bg-sky-100 text-sky-700" },
  {
    value: "MEDIUM",
    label: "Medium",
    activeClassName: "border-amber-400 bg-amber-100 text-amber-700",
  },
  { value: "HIGH", label: "High", activeClassName: "border-red-400 bg-red-100 text-red-700" },
] as const;

export function PriorityPicker({ defaultValue = "MEDIUM" }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div role="radiogroup" aria-label="Priority" className="flex flex-wrap gap-1.5">
      {PRIORITIES.map((priority) => (
        <label
          key={priority.value}
          className={cn(
            "cursor-pointer rounded-full border px-3 py-1 text-sm font-medium transition-colors",
            value === priority.value ? priority.activeClassName : "border-border hover:bg-muted",
          )}
        >
          <input
            type="radio"
            name="priority"
            value={priority.value}
            checked={value === priority.value}
            onChange={() => setValue(priority.value)}
            className="sr-only"
          />
          {priority.label}
        </label>
      ))}
    </div>
  );
}
