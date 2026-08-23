import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/back-link";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";

import { FlashcardDeck } from "./_components/flashcard-deck";

export async function generateMetadata({
  params,
}: PageProps<"/courses/[id]/flashcards/[setId]">): Promise<Metadata> {
  const userId = await requireUserId();
  const { id, setId } = await params;
  const set = await db.flashcardSet.findFirst({
    where: { id: setId, courseId: id, course: { userId } },
    select: { title: true },
  });

  return { title: set?.title ?? "Flashcard set not found" };
}

export default async function FlashcardSetPage({
  params,
}: PageProps<"/courses/[id]/flashcards/[setId]">) {
  const userId = await requireUserId();
  const { id: courseId, setId } = await params;

  const set = await db.flashcardSet.findFirst({
    where: { id: setId, courseId, course: { userId } },
    include: { cards: { orderBy: { order: "asc" } } },
  });

  if (!set) {
    notFound();
  }

  return (
    <main className="max-w-2xl">
      <BackLink href={`/courses/${courseId}/flashcards`}>Back to flashcards</BackLink>
      <h1 className="mt-4 mb-8 text-2xl font-bold tracking-tight">{set.title}</h1>

      <FlashcardDeck cards={set.cards} />
    </main>
  );
}
