import { FileText, Layers3, MessageCircle, SquareStack } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/back-link";
import { IconTile } from "@/components/icon-tile";
import { Button } from "@/components/ui/button";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { ALLOWED_FILE_TYPES, formatFileSize } from "@/lib/uploads";

import { SummarizeDocumentButton } from "../../_components/summarize-document-button";
import { IndexDocumentButton } from "./_components/index-document-button";

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

  const chunkCount = await db.documentChunk.count({ where: { documentId } });

  const typeLabel = ALLOWED_FILE_TYPES[document.mimeType]?.label ?? "File";
  const docQuery = `?documentIds=${document.id}`;

  return (
    <main className="max-w-2xl">
      <BackLink href={`/courses/${courseId}/documents`}>Back to documents</BackLink>

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

      <section aria-labelledby="summary-heading" className="mb-10">
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

      <section aria-labelledby="search-heading" className="mb-10">
        <h2 id="search-heading" className="mb-4 text-lg font-bold">
          Search
        </h2>
        <p className="text-muted-foreground mb-3 text-sm">
          Indexing lets this document show up in &quot;Ask across my whole
          course&quot; chat, which searches by meaning across everything
          you&apos;ve indexed instead of you picking documents by hand.
        </p>
        <IndexDocumentButton
          courseId={courseId}
          documentId={document.id}
          indexed={document.indexedAt !== null}
          chunkCount={chunkCount}
        />
      </section>

      <section aria-labelledby="study-tools-heading">
        <h2 id="study-tools-heading" className="mb-4 text-lg font-bold">
          Study this document
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" nativeButton={false} render={
            <Link href={`/courses/${courseId}/quiz${docQuery}`}>
              <SquareStack />
              Quiz on this document
            </Link>
          } />
          <Button variant="outline" size="sm" nativeButton={false} render={
            <Link href={`/courses/${courseId}/flashcards${docQuery}`}>
              <Layers3 />
              Flashcards from this document
            </Link>
          } />
          <Button variant="outline" size="sm" nativeButton={false} render={
            <Link href={`/courses/${courseId}/chat${docQuery}`}>
              <MessageCircle />
              Chat about this document
            </Link>
          } />
        </div>
      </section>
    </main>
  );
}
