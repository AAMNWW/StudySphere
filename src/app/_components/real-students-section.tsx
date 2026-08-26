import Image from "next/image";

import { Reveal, RevealGroup, RevealItem } from "./reveal";

const PHOTOS = [
  {
    src: "/photos/study-library.jpg",
    alt: "A student studying at a library table surrounded by open books and a laptop",
  },
  {
    src: "/photos/study-cafe.jpg",
    alt: "Three friends laughing together while studying with laptops at a cafe table",
  },
  {
    src: "/photos/study-group.jpg",
    alt: "A group of five students studying together around a table covered in notebooks",
  },
];

export function RealStudentsSection() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16">
      <Reveal className="text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Built for actual studying
        </h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-lg text-sm">
          Library tables, group projects, coffee-shop cram sessions — wherever
          it happens, Academique is the one tab you keep open.
        </p>
      </Reveal>

      <RevealGroup className="mt-10 grid gap-5 sm:grid-cols-3" stagger={0.1}>
        {PHOTOS.map(({ src, alt }) => (
          <RevealItem key={src}>
            <div className="bg-muted relative aspect-[4/5] overflow-hidden rounded-3xl shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md">
              <Image
                src={src}
                alt={alt}
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
