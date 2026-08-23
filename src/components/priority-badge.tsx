import type { AssignmentPriority } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";

const PRIORITY_STYLES: Record<AssignmentPriority, { label: string; className: string }> = {
  LOW: { label: "Low", className: "bg-sky-100 text-sky-700" },
  MEDIUM: { label: "Medium", className: "bg-amber-100 text-amber-700" },
  HIGH: { label: "High", className: "bg-red-100 text-red-700" },
};

/** Compact pill for an assignment's priority. MEDIUM is the common case, so
 * callers that want to reduce clutter can pass `hideMedium`. */
export function PriorityBadge({
  priority,
  hideMedium = false,
  className,
}: {
  priority: AssignmentPriority;
  hideMedium?: boolean;
  className?: string;
}) {
  if (hideMedium && priority === "MEDIUM") {
    return null;
  }

  const { label, className: colorClassName } = PRIORITY_STYLES[priority];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[0.7rem] font-medium",
        colorClassName,
        className,
      )}
    >
      {label}
    </span>
  );
}

/** Just the color, as a small dot — for tight spaces like calendar chips. */
export function PriorityDot({ priority, className }: { priority: AssignmentPriority; className?: string }) {
  const dotColor =
    priority === "HIGH" ? "bg-red-500" : priority === "LOW" ? "bg-sky-500" : "bg-amber-500";

  return <span className={cn("inline-block size-1.5 shrink-0 rounded-full", dotColor, className)} />;
}
