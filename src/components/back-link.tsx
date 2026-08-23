import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

/** A page-level "go back" link, styled as a small pill instead of plain
 * underlined text — used above a page's header wherever there's a parent
 * list to return to (e.g. "Back to quizzes" from one quiz). */
export function BackLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "text-muted-foreground hover:bg-muted hover:text-foreground -ml-2.5 inline-flex items-center gap-1.5 rounded-full py-1.5 pr-3 pl-2.5 text-sm font-medium transition-colors",
        className,
      )}
    >
      <ArrowLeft className="size-3.5" />
      {children}
    </Link>
  );
}
