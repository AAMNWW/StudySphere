import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { NavUser } from "@/components/nav-user";

const geistSans = Geist({
  variable: "--font-geist-sans",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
            <span className="font-heading font-medium">StudySphere AI</span>
            <NavUser />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
