import { StickyNote } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { IconTile } from "@/components/icon-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";

import { CreateNoteForm } from "../_components/create-note-form";
import { NoteCard } from "../_components/note-card";

export async function generateMetadata({
  params,
}: PageProps<"/courses/[id]/notes">): Promise<Metadata> {
  const userId = await requireUserId();
  const { id } = await params;
  const course = await db.course.findFirst({ where: { id, userId }, select: { title: true } });

  return { title: course ? `Notes — ${course.title}` : "Course not found" };
}

export default async function NotesPage({ params }: PageProps<"/courses/[id]/notes">) {
  const userId = await requireUserId();
  const { id: courseId } = await params;

  const course = await db.course.findFirst({
    where: { id: courseId, userId },
    include: { notes: { orderBy: { createdAt: "desc" } } },
  });

  if (!course) {
    notFound();
  }

  return (
    <main className="max-w-2xl">
      <header className="mb-8 flex items-center gap-3">
        <IconTile color="yellow">
          <StickyNote className="size-5" />
        </IconTile>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground text-sm">
            Your own written notes for {course.title}.
          </p>
        </div>
      </header>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Add a note</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateNoteForm courseId={course.id} />
        </CardContent>
      </Card>

      <section aria-labelledby="note-list-heading">
        <h2 id="note-list-heading" className="mb-4 text-lg font-bold">
          {course.notes.length} {course.notes.length === 1 ? "note" : "notes"}
        </h2>

        {course.notes.length === 0 ? (
          <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
            No notes yet. Add your first one above.
          </p>
        ) : (
          <ul className="space-y-4">
            {course.notes.map((note) => (
              <li key={note.id}>
                <NoteCard courseId={course.id} note={note} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
