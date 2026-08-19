import { cn } from "@/lib/utils";

export function ComingSoonBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "bg-muted text-muted-foreground inline-flex w-fit shrink-0 items-center rounded-full px-2 py-0.5 text-[0.65rem] font-medium tracking-wide uppercase",
        className,
      )}
    >
      Coming soon
    </span>
  );
}
