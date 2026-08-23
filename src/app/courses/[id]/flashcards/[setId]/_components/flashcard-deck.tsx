"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { useState } from "react";

import { MotionPop } from "@/app/_components/reveal";
import { ICON_TILE_COLOR_CYCLE, getTileColorClasses } from "@/components/icon-tile";
import { Button } from "@/components/ui/button";

interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  order: number;
}

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 260 : -260,
    opacity: 0,
    rotate: direction > 0 ? 8 : -8,
  }),
  center: { x: 0, opacity: 1, rotate: 0 },
  exit: (direction: number) => ({
    x: direction > 0 ? -260 : 260,
    opacity: 0,
    rotate: direction > 0 ? -8 : 8,
  }),
};

export function FlashcardDeck({ cards }: { cards: FlashcardItem[] }) {
  const sorted = cards.slice().sort((a, b) => a.order - b.order);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState(1);

  const card = sorted[index];

  function go(delta: number) {
    setDirection(delta);
    setFlipped(false);
    setIndex((current) => Math.min(Math.max(current + delta, 0), sorted.length - 1));
  }

  if (!card) {
    return null;
  }

  const colorClasses = getTileColorClasses(
    ICON_TILE_COLOR_CYCLE[index % ICON_TILE_COLOR_CYCLE.length],
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-56 w-full max-w-md" style={{ perspective: 1200 }}>
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.button
            key={card.id}
            type="button"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFlipped((value) => !value)}
            aria-label="Flip card"
            className="absolute inset-0 h-full w-full"
            style={{ transformStyle: "preserve-3d" }}
          >
            <motion.div
              className="relative h-full w-full"
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.4 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div
                className={`absolute inset-0 flex items-center justify-center rounded-2xl border border-black/5 p-6 text-center shadow-sm ${colorClasses}`}
                style={{ backfaceVisibility: "hidden" }}
              >
                <div>
                  <p className="mb-3 flex items-center justify-center gap-1.5 text-xs font-medium tracking-wide uppercase opacity-70">
                    <RotateCw className="size-3.5" />
                    Term
                  </p>
                  <p className="text-lg font-medium">{card.front}</p>
                </div>
              </div>
              <div
                className={`absolute inset-0 flex items-center justify-center rounded-2xl border border-black/5 p-6 text-center shadow-sm ${colorClasses}`}
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <div>
                  <p className="mb-3 flex items-center justify-center gap-1.5 text-xs font-medium tracking-wide uppercase opacity-70">
                    <RotateCw className="size-3.5" />
                    Answer
                  </p>
                  <p className="text-lg font-medium">{card.back}</p>
                </div>
              </div>
            </motion.div>
          </motion.button>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-4">
        <MotionPop>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={index === 0}
            onClick={() => go(-1)}
            aria-label="Previous card"
          >
            <ChevronLeft />
          </Button>
        </MotionPop>
        <p className="text-muted-foreground text-sm tabular-nums">
          {index + 1} / {sorted.length}
        </p>
        <MotionPop>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={index === sorted.length - 1}
            onClick={() => go(1)}
            aria-label="Next card"
          >
            <ChevronRight />
          </Button>
        </MotionPop>
      </div>

      <div className="bg-muted h-1.5 w-full max-w-md overflow-hidden rounded-full">
        <motion.div
          className={`h-full rounded-full ${colorClasses.split(" ")[0]}`}
          initial={false}
          animate={{ width: `${((index + 1) / sorted.length) * 100}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 30 }}
        />
      </div>
    </div>
  );
}
