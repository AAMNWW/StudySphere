import { cn } from "@/lib/utils";

/** % of a course's assignments marked complete. Null total (no assignments
 * yet) shows a neutral "no assignments yet" state instead of 0%, since
 * there's nothing to measure progress against. */
export function CourseProgressBar({
  completed,
  total,
  className,
}: {
  completed: number;
  total: number;
  className?: string;
}) {
  if (total === 0) {
    return (
      <p className={cn("text-muted-foreground text-xs", className)}>No assignments yet</p>
    );
  }

  const percent = Math.round((completed / total) * 100);

  return (
    <div className={className}>
      <div className="text-muted-foreground mb-1 flex items-center justify-between text-xs">
        <span>Progress</span>
        <span className="tabular-nums">{percent}%</span>
      </div>
      <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
