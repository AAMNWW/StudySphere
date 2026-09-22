import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "../globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Academique",
    template: "%s · Academique",
  },
  description:
    "An AI-powered learning workspace for organising courses, notes and study material.",
};

// Its own root layout — deliberately no header/footer/nav chrome, so
// sign-in and sign-up read as a focused, standalone flow rather than a page
// wrapped in the marketing site. See node_modules/next/dist/docs/.../
// route-groups.md's "multiple root layouts" pattern; (app)/layout.tsx is
// the sibling root layout for every other route.
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {/* No chrome of its own: each auth screen owns its own brand
              placement (on the photo panel, or above the form on mobile) via
              AuthSplitLayout. */}
          <div className="flex flex-1 flex-col">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
