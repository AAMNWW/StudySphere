import { BookOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { CourseProgressBar } from "@/components/course-progress-bar";
import { ICON_TILE_COLOR_CYCLE, IconTile } from "@/components/icon-tile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUserId } from "@/lib/auth";
import { courseToolHref, findGlobalTool } from "@/lib/course-tools";
import { db } from "@/lib/db";

/**
 * A course section reached *before* a course is chosen — "I want to do a
 * quiz", then pick which course. Everything in CourseSidebar previously
 * required already being inside a course, so with no course open there was
 * no route to Quiz, Flashcards or anything else at all.
 *
 * One dynamic route rather than a page per tool: the sections come from
 * COURSE_TOOLS (src/lib/course-tools.ts), so adding one there gives it a
 * top-level entry point for free.
 *
 * Deliberately no "skip the picker when there's only one course" shortcut.
 * `redirect()` here lands after the render has begun streaming (there's a
 * loading boundary above this route), so Next can't set a 307 and falls back
 * to `<meta http-equiv="refresh" content="1;url=…">` — a full page load
 * would flash this picker for a second before moving on. One course means
 * one card to click, which is no worse and never janks.
 */
export async function generateMetadata({
  params,
}: PageProps<"/tools/[tool]">): Promise<Metadata> {
  const { tool: slug } = await params;
  const tool = findGlobalTool(slug);

  return { title: tool ? `${tool.label} — choose a course` : "Not found" };
}

export default async function ToolPage({ params }: PageProps<"/tools/[tool]">) {
  const userId = await requireUserId();
  const { tool: slug } = await params;
  const tool = findGlobalTool(slug);

  if (!tool) {
    notFound();
  }

  const session = await auth();

  const courses = await db.course.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      assignments: { select: { completed: true } },
    },
  });

  const Icon = tool.icon;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:gap-8">
      <AppSidebar isAdmin={session?.user?.role === "ADMIN"} />
      <main className="min-w-0 flex-1">
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <IconTile color={tool.color}>
              <Icon className="size-5" />
            </IconTile>
            <h1 className="text-3xl font-bold tracking-tight">{tool.label}</h1>
          </div>
          {tool.description ? (
            <p className="text-muted-foreground mt-2">{tool.description}</p>
          ) : null}
        </header>

        {courses.length === 0 ? (
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>Add a course first</CardTitle>
              <CardDescription>
                {tool.label} works on the material inside a course, so there
                needs to be one to open it for.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/courses" className="text-sm underline underline-offset-4">
                Add your first course →
              </Link>
            </CardContent>
          </Card>
        ) : (
          <section aria-labelledby="choose-course-heading">
            <h2 id="choose-course-heading" className="mb-4 text-lg font-bold">
              Choose a course
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course, index) => (
                <li key={course.id}>
                  <Link href={courseToolHref(tool, course.id)} className="block h-full">
                    <Card className="h-full transition-colors hover:bg-muted/50">
                      <CardHeader>
                        <IconTile
                          color={ICON_TILE_COLOR_CYCLE[index % ICON_TILE_COLOR_CYCLE.length]}
                        >
                          <BookOpen className="size-5" />
                        </IconTile>
                        <CardTitle className="mt-3">{course.title}</CardTitle>
                        {course.description ? (
                          <CardDescription>{course.description}</CardDescription>
                        ) : null}
                      </CardHeader>
                      <CardContent>
                        <CourseProgressBar
                          completed={course.assignments.filter((a) => a.completed).length}
                          total={course.assignments.length}
                        />
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
