import { FileText } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { IconTile } from "@/components/icon-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { blobStorageConfigured } from "@/lib/uploads";

import { DocumentRow } from "../_components/document-row";
import { UploadDocumentForm } from "../_components/upload-document-form";

export async function generateMetadata({
  params,
}: PageProps<"/courses/[id]/documents">): Promise<Metadata> {
  const userId = await requireUserId();
  const { id } = await params;
  const course = await db.course.findFirst({ where: { id, userId }, select: { title: true } });

  return { title: course ? `Documents — ${course.title}` : "Course not found" };
}

export default async function DocumentsPage({
  params,
}: PageProps<"/courses/[id]/documents">) {
  const userId = await requireUserId();
  const { id: courseId } = await params;

  const course = await db.course.findFirst({
    where: { id: courseId, userId },
    include: { documents: { orderBy: { createdAt: "desc" } } },
  });

  if (!course) {
    notFound();
  }

  return (
    <main className="max-w-2xl">
      <header className="mb-8 flex items-center gap-3">
        <IconTile color="blue">
          <FileText className="size-5" />
        </IconTile>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground text-sm">
            Upload the material you want quizzes, flashcards, chat and notes grounded in.
          </p>
        </div>
      </header>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Add a document</CardTitle>
        </CardHeader>
        <CardContent>
          <UploadDocumentForm courseId={course.id} blobEnabled={blobStorageConfigured()} />
        </CardContent>
      </Card>

      <section aria-labelledby="document-list-heading">
        <h2 id="document-list-heading" className="mb-4 text-lg font-bold">
          {course.documents.length}{" "}
          {course.documents.length === 1 ? "document" : "documents"}
        </h2>

        {course.documents.length === 0 ? (
          <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
            No documents yet. Upload your first one above.
          </p>
        ) : (
          <ul className="space-y-4">
            {course.documents.map((document) => (
              <li key={document.id}>
                <DocumentRow courseId={course.id} document={document} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
