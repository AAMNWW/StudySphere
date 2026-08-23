import { Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import Link from "next/link";
import { ThemeProvider } from "next-themes";
import "./globals.css";

import { auth } from "@/auth";
import { IconTile } from "@/components/icon-tile";
import { MainNav } from "@/components/main-nav";
import { NavUser } from "@/components/nav-user";
import { NotificationBell } from "@/components/notification-bell";
import { SiteFooter } from "@/components/site-footer";
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
  // "Courses · StudySphere AI" without every page repeating the app name.
  title: {
    default: "StudySphere AI",
    template: "%s · StudySphere AI",
  },
  description:
    "An AI-powered learning workspace for organising courses, notes and study material.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  // GRAPHITE (the app's original grayscale look) needs no data-accent
  // override, so the attribute is only set once a student has picked
  // something else — see the `[data-accent]` blocks in globals.css.
  const accentColor = session?.user?.id
    ? (
        await db.user.findUnique({
          where: { id: session.user.id },
          select: { accentColor: true },
        })
      )?.accentColor
    : null;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-accent={accentColor && accentColor !== "GRAPHITE" ? accentColor.toLowerCase() : undefined}
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <header className="border-b">
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
              <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-2">
                  <IconTile color="purple" size="sm">
                    <Sparkles className="size-4" />
                  </IconTile>
                  <span className="font-heading text-lg font-bold tracking-tight">
                    StudySphere AI
                  </span>
                </Link>
                <MainNav />
              </div>
              <div className="flex items-center gap-3">
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
