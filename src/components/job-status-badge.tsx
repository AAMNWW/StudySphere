import type { JobApplicationStatus } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";

export const JOB_STATUS_OPTIONS: { value: JobApplicationStatus; label: string }[] = [
  { value: "SAVED", label: "Saved" },
  { value: "APPLIED", label: "Applied" },
  { value: "INTERVIEWING", label: "Interviewing" },
  { value: "OFFER", label: "Offer" },
  { value: "REJECTED", label: "Rejected" },
];

const STATUS_STYLES: Record<JobApplicationStatus, string> = {
  SAVED: "bg-muted text-muted-foreground",
  APPLIED: "bg-sky-100 text-sky-700",
  INTERVIEWING: "bg-amber-100 text-amber-700",
  OFFER: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

export function jobStatusLabel(status: JobApplicationStatus): string {
  return JOB_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export function JobStatusBadge({
  status,
  className,
}: {
  status: JobApplicationStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[0.7rem] font-medium",
        STATUS_STYLES[status],
        className,
      )}
    >
      {jobStatusLabel(status)}
    </span>
  );
}
