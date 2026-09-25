import { ExternalLink, FileText, Globe, Link2, PlaySquare, Presentation } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { IconTile, type IconTileColor } from "@/components/icon-tile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";

import { AddResourceForm } from "./_components/add-resource-form";
import { DeleteResourceButton } from "./_components/delete-resource-button";

export async function generateMetadata({
  params,
}: PageProps<"/courses/[id]/resources">): Promise<Metadata> {
  const userId = await requireUserId();
  const { id } = await params;
  const course = await db.course.findFirst({ where: { id, userId }, select: { title: true } });

  return { title: course ? `Resources — ${course.title}` : "Course not found" };
}

/** A friendlier label and icon for well-known kinds of link. */
function describeLink(url: string): { kind: string; icon: typeof Globe; color: IconTileColor } {
  const { hostname, pathname } = new URL(url);
  const host = hostname.replace(/^www\./, "");

  if (/(^|\.)youtube\.com$|^youtu\.be$|(^|\.)vimeo\.com$/.test(host)) {
    return { kind: "Video", icon: PlaySquare, color: "red" };
  }
  if (host === "docs.google.com" && pathname.startsWith("/presentation")) {
    return { kind: "Slides", icon: Presentation, color: "yellow" };
  }
  if (/\.pdf$/i.test(pathname) || /^(docs|drive)\.google\.com$|(^|\.)notion\.(so|site)$/.test(host)) {
    return { kind: "Document", icon: FileText, color: "blue" };
  }
  return { kind: "Website", icon: Globe, color: "green" };
}

export default async function ResourcesPage({ params }: PageProps<"/courses/[id]/resources">) {
  const userId = await requireUserId();
  const { id: courseId } = await params;

  const course = await db.course.findFirst({
    where: { id: courseId, userId },
    select: { id: true, title: true },
  });

  if (!course) {
    notFound();
  }

  const resources = await db.courseResource.findMany({
    where: { courseId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="max-w-2xl">
      <header className="mb-8 flex items-center gap-3">
        <IconTile color="blue">
          <Link2 className="size-5" />
        </IconTile>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resources</h1>
          <p className="text-muted-foreground text-sm">
            Online material for {course.title}: videos, articles, course sites, shared docs.
          </p>
        </div>
      </header>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Add a link</CardTitle>
          <CardDescription>
            Paste any web link. It opens in a new tab, so nothing needs downloading or re-uploading.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddResourceForm courseId={course.id} />
        </CardContent>
      </Card>

      <section aria-labelledby="resource-list-heading">
        <h2 id="resource-list-heading" className="mb-4 text-lg font-bold">
          {resources.length} {resources.length === 1 ? "link" : "links"}
        </h2>

        {resources.length === 0 ? (
          <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
            No links yet. Save your first one above.
          </p>
        ) : (
          <ul className="space-y-3">
            {resources.map((resource) => {
              const { kind, icon: Icon, color } = describeLink(resource.url);
              const host = new URL(resource.url).hostname.replace(/^www\./, "");

              return (
                <li key={resource.id}>
                  <Card size="sm">
                    <CardContent className="flex items-start gap-3">
                      <IconTile color={color} size="sm">
                        <Icon className="size-4" />
                      </IconTile>
                      <div className="min-w-0 flex-1">
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="flex items-center gap-1.5 font-medium hover:underline"
                        >
                          <span className="truncate">{resource.title}</span>
                          <ExternalLink className="text-muted-foreground size-3.5 shrink-0" />
                        </a>
                        <p className="text-muted-foreground mt-0.5 truncate text-xs">
                          {kind} · {host}
                        </p>
                        {resource.note ? <p className="mt-2 text-sm">{resource.note}</p> : null}
                      </div>
                      <DeleteResourceButton
                        courseId={course.id}
                        resourceId={resource.id}
                        title={resource.title}
                      />
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
