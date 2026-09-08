"use client";

import { animate } from "framer-motion";
import { Flame } from "lucide-react";
import { useEffect, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";

function useCountUp(target: number) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, target, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: (latest) => setValue(Math.round(latest)),
    });
    return () => controls.stop();
  }, [target]);

  return value;
}

export function StreakCard({ current, longest }: { current: number; longest: number }) {
  const animatedCurrent = useCountUp(current);

  return (
    <Card className="border-none bg-gradient-to-br from-amber-100 via-orange-100 to-amber-50">
      <CardContent className="flex items-center gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/60 shadow-sm">
          <Flame className="size-7 text-orange-500" />
        </div>
        <div>
          <p className="flex items-baseline gap-1.5 text-3xl leading-none font-bold tabular-nums text-orange-900">
            {animatedCurrent}
            <span className="text-base font-medium text-orange-700">
              {current === 1 ? "day streak" : "day streak"}
            </span>
          </p>
          <p className="mt-1.5 text-sm text-orange-700/80">
            {longest > current ? `Longest streak: ${longest} days` : "Your longest streak yet"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
