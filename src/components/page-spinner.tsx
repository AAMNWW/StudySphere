import { Logo } from "@/components/logo";

/**
 * Shared `loading.tsx` fallback — a bouncing mark over three pastel dots.
 *
 * Deliberately not a per-page skeleton: the point is instant, friendly
 * feedback on click while Next.js prefetches the route's shell. Pure CSS
 * animation (no client component) so it can render inside any server
 * boundary, and `motion-reduce` turns the hop off for anyone who asked for
 * less movement.
 */

const DOTS = [
  "bg-purple-300",
  "bg-amber-300",
  "bg-emerald-300",
];

export function PageSpinner() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex min-h-[40vh] flex-col items-center justify-center gap-4"
    >
      <Logo className="h-14 w-auto animate-bounce motion-reduce:animate-none" />

      <div className="flex gap-1.5">
        {DOTS.map((color, index) => (
          <span
            key={color}
            className={`size-2 animate-pulse rounded-full motion-reduce:animate-none ${color}`}
            style={{ animationDelay: `${index * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
