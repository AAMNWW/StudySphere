import { Loader2 } from "lucide-react";

/**
 * Shared `loading.tsx` fallback. Kept deliberately minimal (a spinner, not a
 * per-page skeleton) — the point is to give instant feedback on click and
 * let Next.js prefetch the route's shell, not to visually match every
 * page's final layout.
 */
export function PageSpinner() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader2 className="text-muted-foreground size-6 animate-spin" aria-label="Loading" />
    </div>
  );
}
