import { percentToGrade } from "@/lib/grades";
import { cn } from "@/lib/utils";

/** Shown once both earnedPoints and maxPoints are set on an Assignment or
 * Exam — "92% (A-)". Renders nothing for an ungraded item, so callers can
 * use it unconditionally without their own null-check. */
export function GradeBadge({
  earnedPoints,
  maxPoints,
  className,
}: {
  earnedPoints: number | null;
  maxPoints: number | null;
  className?: string;
}) {
  if (earnedPoints == null || maxPoints == null || maxPoints <= 0) {
    return null;
  }

  const percent = (earnedPoints / maxPoints) * 100;
  const { letter } = percentToGrade(percent);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[0.7rem] font-medium text-emerald-700",
        className,
      )}
    >
      {Math.round(percent)}% ({letter})
    </span>
  );
}
