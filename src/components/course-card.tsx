import { BookOpen } from "lucide-react";
import Link from "next/link";

import { ExpandableText } from "@/components/expandable-text";
import { IconTile, type IconTileColor } from "@/components/icon-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * One course in a grid (dashboard, /courses, the /tools course picker).
 *
 * Every card in a row is the same height, with the footer (`children` —
 * progress bar, counts) pinned to the bottom so those line up across cards
 * regardless of how long each title or description is. Long descriptions
 * clamp to two lines with a "See more" toggle.
 *
 * The whole card is clickable via a stretched title link rather than a
 * wrapping <Link>, because the "See more" button inside can't legally sit in
 * an <a>.
 */
export function CourseCard({
  href,
  title,
  description,
  color,
  className,
  children,
}: {
  href: string;
  title: string;
  description?: string | null;
  color: IconTileColor;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card
      className={cn(
        "hover:bg-muted/40 focus-within:ring-ring/50 relative h-full transition-[background-color,translate] duration-200 focus-within:ring-3 hover:-translate-y-0.5",
        className,
      )}
    >
      <CardHeader>
        <IconTile color={color}>
          <BookOpen className="size-5" />
        </IconTile>
        <CardTitle className="mt-3 line-clamp-2" title={title}>
          <Link href={href} className="outline-none after:absolute after:inset-0">
            {title}
          </Link>
        </CardTitle>
        {description ? <ExpandableText text={description} /> : null}
      </CardHeader>
      {children ? <CardContent className="mt-auto space-y-3">{children}</CardContent> : null}
    </Card>
  );
}
