"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { Parallax, useStill } from "./motion";
import { SectionHeading } from "./ui";

const COLUMNS: {
  src: string;
  alt: string;
  aspect: string;
  distance: number;
  offset: string;
}[] = [
  {
    src: "/photos/study-outdoor.jpg",
    alt: "Students studying together outside on campus",
    aspect: "aspect-[3/4]",
    distance: 70,
    offset: "",
  },
  {
    src: "/photos/study-library-group.jpg",
    alt: "A study group working through material together at a library table",
    aspect: "aspect-[4/5]",
    distance: -80,
    offset: "sm:mt-10",
  },
  {
    src: "/photos/study-cafe.jpg",
    alt: "Friends laughing while studying with laptops at a cafe table",
    aspect: "aspect-[3/4]",
    distance: 60,
    offset: "sm:mt-4",
  },
];

export function GallerySection() {
  const reduce = useStill();

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-14 sm:py-16">
      <SectionHeading
        eyebrow="In practice"
        title="Built for how studying actually goes."
        description="Library tables at 9pm, group projects in a group chat, a coffee-shop cram the morning of. Wherever it happens, this is the tab you keep open."
      />

      {/* Three columns drifting at different speeds — the grid pulls apart
          slightly as the section passes through the viewport. */}
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {COLUMNS.map((column, index) => (
          <Parallax
            key={column.src}
            distance={column.distance}
            className={column.offset}
          >
            <div
              className={`bg-muted relative ${column.aspect} overflow-hidden rounded-3xl border border-black/5 shadow-sm dark:border-white/10`}
            >
              {/* A slow push-in and back out, so the photos never freeze. */}
              <motion.div
                className="absolute inset-0"
                animate={reduce ? undefined : { scale: [1, 1.08, 1] }}
                transition={{
                  duration: 16,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 2,
                }}
              >
                <Image
                  src={column.src}
                  alt={column.alt}
                  fill
                  sizes="(min-width: 640px) 32vw, 100vw"
                  className="object-cover"
                />
              </motion.div>
            </div>
          </Parallax>
        ))}
      </div>
    </section>
  );
}
