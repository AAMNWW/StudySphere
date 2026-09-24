"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const CLAMP_CLASSES = {
  2: "line-clamp-2",
  3: "line-clamp-3",
} as const;

/**
 * Text clamped to a fixed number of lines, with a "See more" toggle that only
 * appears when the text actually overflows. Keeps cards in a grid the same
 * shape no matter how long a description someone typed.
 *
 * The toggle is `relative z-10` so it sits above a stretched-link overlay
 * (`after:absolute after:inset-0` on the card's title link) — clicking the
 * text itself still opens the card, only the button expands it.
 */
export function ExpandableText({
  text,
  lines = 2,
  className,
}: {
  text: string;
  lines?: keyof typeof CLAMP_CLASSES;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || expanded) {
      return;
    }

    // Re-measured on resize: the same text can fit on a wide screen and
    // overflow on a narrow one.
    const observer = new ResizeObserver(() => {
      setOverflows(element.scrollHeight > element.clientHeight + 1);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [expanded, text]);

  return (
    <div className={className}>
      <p
        ref={ref}
        className={cn("text-muted-foreground text-sm", !expanded && CLAMP_CLASSES[lines])}
      >
        {text}
      </p>
      {overflows || expanded ? (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          className="text-primary relative z-10 mt-1 cursor-pointer text-xs font-medium hover:underline"
        >
          {expanded ? "See less" : "See more"}
        </button>
      ) : null}
    </div>
  );
}
