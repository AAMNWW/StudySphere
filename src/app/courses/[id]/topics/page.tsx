import { CalendarDays } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { IconTile } from "@/components/icon-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";

import { CreateTopicForm } from "./_components/create-topic-form";
import { SuggestTopicsPanel } from "./_components/suggest-topics-panel";
import { TopicCard } from "./_components/topic-card";

export async function generateMetadata({
  params,
}: PageProps<"/courses/[id]/topics">): Promise<Metadata> {
  const userId = await requireUserId();
  const { id } = await params;
  const course = await db.course.findFirst({ where: { id, userId }, select: { title: true } });

  return { title: course ? `Topics — ${course.title}` : "Course not found" };
}

export default async function TopicsPage({ params }: PageProps<"/courses/[id]/topics">) {
  const userId = await requireUserId();
  const { id: courseId } = await params;

  const course = await db.course.findFirst({ where: { id: courseId, userId } });

  if (!course) {
    notFound();
  }

  const [documents, topics] = await Promise.all([
    db.document.findMany({
      where: { courseId },
      orderBy: { createdAt: "desc" },
      select: { id: true, fileName: true },
    }),
    db.topic.findMany({
      where: { courseId },
      orderBy: [{ weekNumber: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
    }),
  ]);

  const groups = new Map<number | null, typeof topics>();
  for (const topic of topics) {
    const key = topic.weekNumber;
    groups.set(key, [...(groups.get(key) ?? []), topic]);
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <Link
        href={`/courses/${courseId}`}
        className="text-muted-foreground text-sm hover:underline"
      >
        ← Back to {course.title}
      </Link>

      <header className="mt-4 mb-8 flex items-center gap-3">
        <IconTile color="green">
          <CalendarDays className="size-5" />
        </IconTile>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Topics</h1>
          <p className="text-muted-foreground text-sm">
            What to study for {course.title}, week by week.
          </p>
        </div>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Suggest with AI</CardTitle>
        </CardHeader>
        <CardContent>
          <SuggestTopicsPanel courseId={courseId} documents={documents} />
        </CardContent>
      </Card>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Add a topic manually</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateTopicForm courseId={courseId} />
        </CardContent>
      </Card>

      <section aria-labelledby="topic-list-heading">
        <h2 id="topic-list-heading" className="mb-4 text-lg font-bold">
          {topics.length} {topics.length === 1 ? "topic" : "topics"}
        </h2>

        {topics.length === 0 ? (
          <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
            No topics yet. Suggest some with AI or add your own above.
          </p>
        ) : (
          <div className="space-y-6">
            {[...groups.entries()].map(([weekNumber, weekTopics]) => (
              <div key={weekNumber ?? "unscheduled"}>
                <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
                  {weekNumber !== null ? `Week ${weekNumber}` : "Unscheduled"}
                </h3>
                <ul className="space-y-3">
                  {weekTopics.map((topic) => (
                    <li key={topic.id}>
                      <TopicCard courseId={courseId} topic={topic} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
