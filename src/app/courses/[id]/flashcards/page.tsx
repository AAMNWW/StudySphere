import { Layers3 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RevealGroup, RevealItem } from "@/app/_components/reveal";
import { IconTile } from "@/components/icon-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";

import { GenerateFlashcardsForm } from "./_components/generate-flashcards-form";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export async function generateMetadata({
  params,
}: PageProps<"/courses/[id]/flashcards">): Promise<Metadata> {
  const userId = await requireUserId();
  const { id } = await params;
  const course = await db.course.findFirst({ where: { id, userId }, select: { title: true } });

  return { title: course ? `Flashcards — ${course.title}` : "Course not found" };
}

export default async function FlashcardsHubPage({
  params,
  searchParams,
}: PageProps<"/courses/[id]/flashcards">) {
  const userId = await requireUserId();
  const { id: courseId } = await params;
  const { documentIds } = await searchParams;
  const defaultDocumentIds =
    typeof documentIds === "string" ? [documentIds] : documentIds;

  const course = await db.course.findFirst({ where: { id: courseId, userId } });

  if (!course) {
    notFound();
  }

  const [documents, sets] = await Promise.all([
    db.document.findMany({
      where: { courseId },
      orderBy: { createdAt: "desc" },
      select: { id: true, fileName: true },
    }),
    db.flashcardSet.findMany({
      where: { courseId },
      orderBy: { createdAt: "desc" },
      include: { cards: { select: { id: true } } },
    }),
  ]);

  return (
    <main className="max-w-2xl">
      <header className="mb-8 flex items-center gap-3">
        <IconTile color="blue">
          <Layers3 className="size-5" />
        </IconTile>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Flashcards</h1>
          <p className="text-muted-foreground text-sm">
            Study this course, a document, or a specific topic with flashcards.
          </p>
        </div>
      </header>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle>New flashcard set</CardTitle>
        </CardHeader>
        <CardContent>
          <GenerateFlashcardsForm
            courseId={courseId}
            documents={documents}
            defaultDocumentIds={defaultDocumentIds}
          />
        </CardContent>
      </Card>

      <section aria-labelledby="flashcard-set-list-heading">
        <h2 id="flashcard-set-list-heading" className="mb-4 text-lg font-bold">
          {sets.length} past {sets.length === 1 ? "set" : "sets"}
        </h2>

        {sets.length === 0 ? (
          <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
            No flashcard sets yet. Generate your first one above.
          </p>
        ) : (
          <RevealGroup className="space-y-3" stagger={0.06}>
            {sets.map((set) => (
              <RevealItem key={set.id}>
                <Link href={`/courses/${courseId}/flashcards/${set.id}`} className="block">
                  <Card className="transition-transform duration-200 hover:-translate-y-0.5 hover:bg-muted/50">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-base">{set.title}</CardTitle>
                        <span className="text-muted-foreground text-xs">
                          {dateFormatter.format(set.createdAt)}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {set.cards.length} {set.cards.length === 1 ? "card" : "cards"}
                      </p>
                    </CardHeader>
                  </Card>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </section>
    </main>
  );
}
