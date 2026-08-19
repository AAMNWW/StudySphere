import Link from "next/link";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconTile, type IconTileColor } from "@/components/icon-tile";

/**
 * A large clickable entry point for a course-level feature (Quiz,
 * Flashcards, Chat, Topics, Assignments) — bigger and more prominent than a
 * plain outline Button, since these are meant to read as the primary ways
 * into the course rather than secondary actions.
 */
export function FeatureTile({
  href,
  color,
  icon,
  title,
  description,
  count,
}: {
  href: string;
  color: IconTileColor;
  icon: React.ReactNode;
  title: string;
  description: string;
  count?: number;
}) {
  return (
    <Link href={href} className="block h-full">
      <Card className="h-full transition-transform duration-200 hover:-translate-y-0.5 hover:bg-muted/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <IconTile color={color} size="lg">
              {icon}
            </IconTile>
            {count !== undefined ? (
              <span className="text-muted-foreground mt-1 text-sm font-medium tabular-nums">
                {count}
              </span>
            ) : null}
          </div>
          <CardTitle className="mt-3 text-base">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
