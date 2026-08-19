import { FileText, Layers3, MessageCircle, SquareStack } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { IconTile } from "@/components/icon-tile";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { ALLOWED_FILE_TYPES, formatFileSize } from "@/lib/uploads";

import { SummarizeDocumentButton } from "../../_components/summarize-document-button";
import { DocumentChat } from "./_components/document-chat";
import { FlashcardDeck } from "./_components/flashcard-deck";
import { GenerateFlashcardsButton } from "./_components/generate-flashcards-button";
import { GenerateQuizButton } from "./_components/generate-quiz-button";
import { QuizPanel } from "./_components/quiz-panel";

export async function generateMetadata({
  params,
}: PageProps<"/courses/[id]/documents/[documentId]">): Promise<Metadata> {
  const userId = await requireUserId();
  const { id, documentId } = await params;
  const document = await db.document.findFirst({
    where: { id: documentId, courseId: id, course: { userId } },
    select: { fileName: true },
  });

  return { title: document?.fileName ?? "Document not found" };
}

export default async function DocumentWorkspacePage({
  params,
}: PageProps<"/courses/[id]/documents/[documentId]">) {
  const userId = await requireUserId();
  const { id: courseId, documentId } = await params;

  const document = await db.document.findFirst({
    where: { id: documentId, courseId, course: { userId } },
  });

  if (!document) {
    notFound();
  }

  const [thread, quiz, flashcardSet] = await Promise.all([
    db.chatThread.findFirst({
      where: { courseId, documentId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    }),
    db.quiz.findFirst({
      where: { documentId },
      orderBy: { createdAt: "desc" },
      include: { questions: { orderBy: { order: "asc" } } },
    }),
    db.flashcardSet.findFirst({
      where: { documentId },
      orderBy: { createdAt: "desc" },
      include: { cards: { orderBy: { order: "asc" } } },
    }),
  ]);

  const typeLabel = ALLOWED_FILE_TYPES[document.mimeType]?.label ?? "File";

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <Link
        href={`/courses/${courseId}`}
        className="text-muted-foreground text-sm hover:underline"
      >
        ← Back to course
      </Link>

      <header className="mt-4 mb-10 flex items-center gap-3">
        <IconTile color="red">
          <FileText className="size-5" />
        </IconTile>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{document.fileName}</h1>
          <p className="text-muted-foreground text-sm">
            {typeLabel} · {formatFileSize(document.sizeBytes)}
          </p>
        </div>
      </header>

      <section aria-labelledby="summary-heading" className="mb-12">
        <h2 id="summary-heading" className="mb-4 text-lg font-bold">
          Summary
        </h2>
        {document.summary ? (
          <p className="text-muted-foreground mb-4 rounded-2xl border border-black/5 bg-purple-50 p-4 text-sm">
            {document.summary}
          </p>
        ) : null}
        {document.summaryError ? (
          <p role="alert" className="text-destructive mb-4 text-sm">
            {document.summaryError}
          </p>
        ) : null}
        <SummarizeDocumentButton
          courseId={courseId}
          documentId={document.id}
          hasSummary={Boolean(document.summary)}
        />
      </section>

      <section aria-labelledby="chat-heading" className="mb-12">
        <h2
          id="chat-heading"
          className="mb-4 flex items-center gap-2 text-lg font-bold"
        >
          <IconTile color="pink" size="sm">
            <MessageCircle className="size-4" />
          </IconTile>
          Chat with this document
        </h2>
        <DocumentChat
          courseId={courseId}
          documentId={document.id}
          fileName={document.fileName}
          messages={thread?.messages ?? []}
        />
      </section>

      <section aria-labelledby="quiz-heading" className="mb-12">
        <h2
          id="quiz-heading"
          className="mb-4 flex items-center gap-2 text-lg font-bold"
        >
          <IconTile color="purple" size="sm">
            <SquareStack className="size-4" />
          </IconTile>
          Quiz
        </h2>
        <div className="mb-4">
          <GenerateQuizButton
            courseId={courseId}
            documentId={document.id}
            hasQuiz={Boolean(quiz)}
          />
        </div>
        {quiz ? (
          <QuizPanel
            courseId={courseId}
            documentId={document.id}
            quizId={quiz.id}
            questions={quiz.questions.map((q) => ({
              id: q.id,
              question: q.question,
              options: q.options as string[],
              correctIndex: q.correctIndex,
              selectedIndex: q.selectedIndex,
              order: q.order,
            }))}
          />
        ) : (
          <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
            No quiz yet. Generate one from this document above.
          </p>
        )}
      </section>

      <section aria-labelledby="flashcards-heading">
        <h2
          id="flashcards-heading"
          className="mb-4 flex items-center gap-2 text-lg font-bold"
        >
          <IconTile color="blue" size="sm">
            <Layers3 className="size-4" />
          </IconTile>
          Flashcards
        </h2>
        <div className="mb-4">
          <GenerateFlashcardsButton
            courseId={courseId}
            documentId={document.id}
            hasSet={Boolean(flashcardSet)}
          />
        </div>
        {flashcardSet ? (
          <FlashcardDeck cards={flashcardSet.cards} />
        ) : (
          <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
            No flashcards yet. Generate a set from this document above.
          </p>
        )}
      </section>
    </main>
  );
}
