import { BookOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AppSidebar } from "@/components/app-sidebar";
import { ICON_TILE_COLOR_CYCLE, IconTile } from "@/components/icon-tile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";

import { CreateCourseForm } from "./_components/create-course-form";

export const metadata: Metadata = {
  title: "Courses",
};

// Fixed locale and time zone so the server always renders the same string a
// user would see, regardless of where the server happens to run.
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export default async function CoursesPage() {
  const userId = await requireUserId();

  // This is a Server Component, so it can query the database directly.
  const courses = await db.course.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:gap-8">
      <AppSidebar />
      <main className="min-w-0 flex-1">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Your courses</h1>
          <p className="text-muted-foreground mt-2">
            Every note, assignment and document you add later will live inside a
            course.
          </p>
        </header>

        <Card className="mb-10 max-w-xl">
          <CardHeader>
            <CardTitle>Add a course</CardTitle>
            <CardDescription>
              Start with the subject you are studying right now.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateCourseForm />
          </CardContent>
        </Card>

        <section aria-labelledby="course-list-heading">
          <h2 id="course-list-heading" className="mb-4 text-lg font-bold">
            {courses.length} {courses.length === 1 ? "course" : "courses"}
          </h2>

          {courses.length === 0 ? (
            <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
              No courses yet. Add your first one above.
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course, index) => (
                <li key={course.id}>
                  <Link href={`/courses/${course.id}`} className="block h-full">
                    <Card className="h-full transition-colors hover:bg-muted/50">
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
                      <CardContent>
                        <p className="text-muted-foreground text-xs">
                          Added {dateFormatter.format(course.createdAt)}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
