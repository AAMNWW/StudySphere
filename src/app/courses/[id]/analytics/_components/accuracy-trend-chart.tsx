"use client";

import { useState } from "react";

export interface AccuracyTrendPoint {
  date: string; // YYYY-MM-DD
  correct: number;
  total: number;
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const WIDTH = 640;
const HEIGHT = 200;
const PAD = { top: 16, right: 16, bottom: 28, left: 32 };

export function AccuracyTrendChart({ data }: { data: AccuracyTrendPoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (data.length < 2) {
    return (
      <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
        Answer quiz questions on at least two different days to see a trend.
      </p>
    );
  }

  const plotWidth = WIDTH - PAD.left - PAD.right;
  const plotHeight = HEIGHT - PAD.top - PAD.bottom;

  const points = data.map((d, i) => {
    const pct = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
    const x = PAD.left + (plotWidth * i) / (data.length - 1);
    const y = PAD.top + plotHeight * (1 - pct / 100);
    return { ...d, pct, x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const hovered = hoverIndex !== null ? points[hoverIndex] : null;
  const last = points[points.length - 1];

  function handleMove(event: React.PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const relativeX = ((event.clientX - rect.left) / rect.width) * WIDTH;
    let nearest = 0;
    let nearestDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - relativeX);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        onPointerMove={handleMove}
        onPointerLeave={() => setHoverIndex(null)}
      >
        {/* baseline */}
        <line
          x1={PAD.left}
          y1={PAD.top + plotHeight}
          x2={WIDTH - PAD.right}
          y2={PAD.top + plotHeight}
          className="stroke-border"
          strokeWidth={1}
        />
        {/* y-axis ticks: 0 / 50 / 100 */}
        {[0, 50, 100].map((tick) => {
          const y = PAD.top + plotHeight * (1 - tick / 100);
          return (
            <g key={tick}>
              <line
                x1={PAD.left}
                y1={y}
                x2={WIDTH - PAD.right}
                y2={y}
                className="stroke-border"
                strokeWidth={1}
                opacity={tick === 0 ? 1 : 0.5}
              />
              <text x={4} y={y + 3} className="fill-muted-foreground text-[9px]">
                {tick}%
              </text>
            </g>
          );
        })}

        {hovered ? (
          <line
            x1={hovered.x}
            y1={PAD.top}
            x2={hovered.x}
            y2={PAD.top + plotHeight}
            className="stroke-border"
            strokeWidth={1}
          />
        ) : null}

        <path d={linePath} fill="none" className="stroke-purple-700" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {points.map((p, i) => (
          <circle
            key={p.date}
            cx={p.x}
            cy={p.y}
            r={i === hoverIndex ? 5 : 4}
            className="fill-purple-700 stroke-card"
            strokeWidth={2}
          />
        ))}

        {/* direct label on the last point, per mark spec (lines label the end) */}
        <text
          x={last.x}
          y={last.y - 10}
          textAnchor="end"
          className="fill-foreground text-[11px] font-semibold"
        >
          {last.pct}%
        </text>
      </svg>

      {hovered ? (
        <div
          className="bg-popover text-popover-foreground pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl border border-black/5 px-2.5 py-1.5 text-xs shadow-lg"
          style={{
            left: `${(hovered.x / WIDTH) * 100}%`,
            top: `${(hovered.y / HEIGHT) * 100 - 4}%`,
          }}
        >
          <p className="font-semibold">{hovered.pct}% correct</p>
          <p className="text-muted-foreground">
            {dateFormatter.format(new Date(`${hovered.date}T00:00:00Z`))} · {hovered.correct}/
            {hovered.total}
          </p>
        </div>
      ) : null}
    </div>
  );
}
