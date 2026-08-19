import { BookOpen, Clock, FileText, Sparkles, StickyNote } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/auth";
import { ICON_TILE_COLOR_CYCLE, IconTile } from "@/components/icon-tile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAssignmentOverdue } from "@/lib/is-assignment-overdue";
import { recordDashboardVisit } from "@/lib/streak";
import { ALLOWED_FILE_TYPES, formatFileSize } from "@/lib/uploads";

import { DashboardAssignmentRow } from "./_components/dashboard-assignment-row";
import { LandingHero } from "./_components/landing-hero";
import { Reveal, RevealGroup, RevealItem } from "./_components/reveal";
import { StreakCard } from "./_components/streak-card";

// Signed-out visitors get the marketing title from the layout default
// ("StudySphere AI"); only the authenticated dashboard needs its own.
export async function generateMetadata(): Promise<Metadata> {
  const session = await auth();
  return session?.user ? { title: "Dashboard" } : {};
}

// Fixed locale and time zone so the server always renders the same string a
// user would see, regardless of where the server happens to run.
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "UTC",
});

const COURSES_SHOWN = 4;
const DUE_SOON_SHOWN = 5;
const RECENT_SHOWN = 5;

const CARD_HOVER = "transition-transform duration-200 hover:-translate-y-0.5";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    return <LandingHero />;
  }

  const userId = await requireUserId();

  const [
    streak,
    courseCount,
    noteCount,
    documentCount,
    overdueCount,
    dueSoonAssignments,
    recentNotes,
    recentDocuments,
    courses,
  ] = await Promise.all([
    recordDashboardVisit(userId),
    db.course.count({ where: { userId } }),
    db.note.count({ where: { course: { userId } } }),
    db.document.count({ where: { course: { userId } } }),
    db.assignment.count({
      where: { completed: false, dueDate: { lt: new Date() }, course: { userId } },
    }),
    db.assignment.findMany({
      where: { completed: false, course: { userId } },
      orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }],
      take: DUE_SOON_SHOWN,
      include: { course: { select: { id: true, title: true } } },
    }),
    db.note.findMany({
      where: { course: { userId } },
      orderBy: { createdAt: "desc" },
      take: RECENT_SHOWN,
      include: { course: { select: { id: true, title: true } } },
    }),
    db.document.findMany({
      where: { course: { userId } },
      orderBy: { createdAt: "desc" },
      take: RECENT_SHOWN,
      include: { course: { select: { id: true, title: true } } },
    }),
    db.course.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: COURSES_SHOWN,
    }),
  ]);

  const firstName = (session?.user?.name ?? session?.user?.email ?? "there")
    .split(" ")[0]
    .split("@")[0];

  const stats = [
    { label: "Courses", value: courseCount, icon: BookOpen, color: "purple" as const },
    { label: "Notes", value: noteCount, icon: StickyNote, color: "yellow" as const },
    { label: "Documents", value: documentCount, icon: FileText, color: "blue" as const },
    {
      label: "Overdue",
      value: overdueCount,
      icon: Clock,
      color: overdueCount > 0 ? ("red" as const) : ("gray" as const),
      destructive: overdueCount > 0,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <Reveal>
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-muted-foreground mt-2">
              Here&apos;s what&apos;s happening across your courses.
            </p>
          </div>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/courses">Manage courses</Link>}
          />
        </header>
      </Reveal>

      <Reveal delay={0.05} className="mb-6">
        <StreakCard current={streak.current} longest={streak.longest} />
      </Reveal>

      <RevealGroup className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4" stagger={0.06}>
        {stats.map(({ label, value, icon: Icon, color, destructive }) => (
          <RevealItem key={label}>
            <Card size="sm" className={CARD_HOVER}>
              <CardContent className="flex items-center gap-3">
                <IconTile color={color} size="sm">
                  <Icon className="size-4" />
                </IconTile>
                <div>
                  <p
                    className={
                      destructive
                        ? "text-destructive text-xl font-bold leading-none"
                        : "text-xl font-bold leading-none"
                    }
                  >
                    {value}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">{label}</p>
                </div>
              </CardContent>
            </Card>
          </RevealItem>
        ))}
      </RevealGroup>

      <Reveal>
        <section aria-labelledby="due-soon-heading" className="mb-10">
          <h2 id="due-soon-heading" className="mb-4 flex items-center gap-2 text-lg font-bold">
            <IconTile color="purple" size="sm">
              <Clock className="size-4" />
            </IconTile>
            Due soon
          </h2>

          {dueSoonAssignments.length === 0 ? (
            <p className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
              Nothing due. Add an assignment from any course page.
            </p>
          ) : (
            <Card>
              <CardContent>
                <ul className="divide-y">
                  {dueSoonAssignments.map((assignment) => (
                    <DashboardAssignmentRow
                      key={assignment.id}
                      courseId={assignment.course.id}
                      courseTitle={assignment.course.title}
                      assignmentId={assignment.id}
                      title={assignment.title}
                      dueDate={assignment.dueDate}
                      isOverdue={isAssignmentOverdue(assignment)}
                    />
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </section>
      </Reveal>

      <div className="mb-10 grid gap-8 sm:grid-cols-2">
        <Reveal>
          <section aria-labelledby="recent-notes-heading">
            <h2
              id="recent-notes-heading"
              className="mb-4 flex items-center gap-2 text-lg font-bold"
            >
              <IconTile color="yellow" size="sm">
                <StickyNote className="size-4" />
              </IconTile>
              Recent notes
            </h2>

            {recentNotes.length === 0 ? (
              <p className="text-muted-foreground rounded-2xl border border-dashed p-6 text-center text-sm">
                No notes yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {recentNotes.map((note) => (
                  <li key={note.id}>
                    <Link
                      href={`/courses/${note.course.id}`}
                      className={`bg-card block rounded-2xl border border-black/5 p-3 shadow-sm transition-colors hover:bg-muted/50 ${CARD_HOVER}`}
                    >
                      <p className="truncate text-sm font-medium">
                        {note.title}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {note.course.title} · {dateFormatter.format(note.createdAt)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </Reveal>

        <Reveal delay={0.05}>
          <section aria-labelledby="recent-documents-heading">
            <h2
              id="recent-documents-heading"
              className="mb-4 flex items-center gap-2 text-lg font-bold"
            >
              <IconTile color="blue" size="sm">
                <FileText className="size-4" />
              </IconTile>
              Recent documents
            </h2>

            {recentDocuments.length === 0 ? (
              <p className="text-muted-foreground rounded-2xl border border-dashed p-6 text-center text-sm">
                No documents yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {recentDocuments.map((document) => (
                  <li key={document.id}>
                    <Link
                      href={`/courses/${document.course.id}`}
                      className={`bg-card block rounded-2xl border border-black/5 p-3 shadow-sm transition-colors hover:bg-muted/50 ${CARD_HOVER}`}
                    >
                      <p className="truncate text-sm font-medium">
                        {document.fileName}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {document.course.title} ·{" "}
                        {ALLOWED_FILE_TYPES[document.mimeType]?.label ?? "File"}{" "}
                        · {formatFileSize(document.sizeBytes)}
                        {document.summary ? (
                          <>
                            {" · "}
                            <Sparkles className="mb-0.5 inline size-3" /> Summarized
                          </>
                        ) : null}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </Reveal>
      </div>

      <Reveal>
        <section aria-labelledby="courses-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2
              id="courses-heading"
              className="flex items-center gap-2 text-lg font-bold"
            >
              <IconTile color="purple" size="sm">
                <BookOpen className="size-4" />
              </IconTile>
              Your courses
            </h2>
            {courseCount > courses.length ? (
              <Link
                href="/courses"
                className="text-muted-foreground text-sm hover:underline"
              >
                View all {courseCount} →
              </Link>
            ) : null}
          </div>

          {courses.length === 0 ? (
            <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
              No courses yet.{" "}
              <Link href="/courses" className="underline">
                Add your first one
              </Link>
              .
            </p>
          ) : (
            <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.06}>
              {courses.map((course, index) => (
                <RevealItem key={course.id}>
                  <Link href={`/courses/${course.id}`} className="block h-full">
                    <Card className={`h-full transition-colors hover:bg-muted/50 ${CARD_HOVER}`}>
                      <CardHeader>
                        <IconTile
                          color={ICON_TILE_COLOR_CYCLE[index % ICON_TILE_COLOR_CYCLE.length]}
                        >
                          <BookOpen className="size-5" />
                        </IconTile>
                        <CardTitle className="mt-3">{course.title}</CardTitle>
                        {course.description ? (
                          <CardDescription>
                            {course.description}
                          </CardDescription>
                        ) : null}
                      </CardHeader>
                    </Card>
                  </Link>
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </section>
      </Reveal>
    </main>
  );
}
