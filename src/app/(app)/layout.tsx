import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import Link from "next/link";
import { ThemeProvider } from "next-themes";
import "../globals.css";

import { auth } from "@/auth";
import { Logo } from "@/components/logo";
import { MainNav } from "@/components/main-nav";
import { NavUser } from "@/components/nav-user";
import { NotificationBell } from "@/components/notification-bell";
import { SiteFooter } from "@/components/site-footer";
import { ThemeDecor } from "@/components/theme-decor";
import { db } from "@/lib/db";

// Named "--font-sans" (rather than e.g. "--font-inter") so it lands
// directly on the CSS variable globals.css's `@theme inline` block reads
// for the `font-sans` utility (`--font-sans: var(--font-sans)`) — no
// separate token to keep in sync.
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // `template` wraps the title exported by each page, so /courses renders as
  // "Courses · Academique" without every page repeating the app name.
  title: {
    default: "Academique",
    template: "%s · Academique",
  },
  description:
    "An AI-powered learning workspace for organising courses, notes and study material.",
};

// This is its own root layout (route-group sibling of (auth), which has a
// separate bare-bones one with no header/footer) — see
// node_modules/next/dist/docs/.../route-groups.md's "multiple root layouts"
// pattern. Each root layout owns its own <html>/<body>.
export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  // GRAPHITE (the default dusty-rose look, styled straight off the app
  // logo) needs no data-palette override, so the attribute is only set once
  // a student has picked something else — see the `[data-palette]` blocks
  // in globals.css. Value is kebab-cased ("SPIDER_MAN" -> "spider-man") to
  // match CSS attribute selector convention.
  const colorPalette = session?.user?.id
    ? (
        await db.user.findUnique({
          where: { id: session.user.id },
          select: { colorPalette: true },
        })
      )?.colorPalette
    : null;
  const paletteAttr =
    colorPalette && colorPalette !== "GRAPHITE"
      ? colorPalette.toLowerCase().replace(/_/g, "-")
      : undefined;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-palette={paletteAttr}
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ThemeDecor />
          {/* One header for the whole app: same max width as the page
              content below it (max-w-6xl) so the logo lines up with the
              first column of every section, and a fixed height so nothing
              shifts as the right-hand controls change between signed-in and
              signed-out. */}
          <header className="border-border/70 bg-background/85 sticky top-0 z-40 border-b backdrop-blur-md">
            <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-6 sm:h-[4.5rem] sm:gap-8">
              <Link
                href="/"
                className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-80"
              >
                <Logo className="h-9 w-auto sm:h-10" />
                <span className="font-heading hidden text-lg font-bold tracking-tight sm:inline">
                  Academique
                </span>
              </Link>

              <MainNav />

              <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
                <NotificationBell />
                <NavUser />
              </div>
            </div>
          </header>
          <div className="flex flex-1 flex-col">{children}</div>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
