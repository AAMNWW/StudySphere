/** Small hand-drawn-style flourishes reused across the landing page —
 * `currentColor` so each usage sets its own color via a text-* class. */

export function DoodleUnderline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 20" fill="none" className={className} aria-hidden>
      <path
        d="M3,13 C 34,4 62,18 94,9 C 126,1 156,16 197,7"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DoodleScribbleCircle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 90" fill="none" className={className} aria-hidden>
      <path
        d="M60,8 C88,6 108,24 110,46 C112,70 92,86 62,84 C32,82 10,66 10,44 C10,24 30,10 56,10"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
