import Link from "next/link";

import { Logo } from "@/components/logo";

const PRODUCT_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#tools", label: "AI tools" },
  { href: "/#pricing", label: "Pricing" },
];

const RESOURCE_LINKS = [
  { href: "/#faq", label: "FAQ" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

const ACCOUNT_LINKS = [
  { href: "/login", label: "Sign in" },
  { href: "/signup", label: "Start for free" },
];

// Signed in, "/" is the dashboard rather than the landing page, so the
// landing-page anchors above would lead nowhere — link into the app instead.
const APP_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/courses", label: "Courses" },
  { href: "/calendar", label: "Calendar" },
  { href: "/career", label: "Career" },
];

const SIGNED_IN_RESOURCE_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

const SIGNED_IN_ACCOUNT_LINKS = [{ href: "/settings", label: "Settings" }];

export function SiteFooter({ signedIn = false }: { signedIn?: boolean }) {
  const columns = signedIn
    ? [
        { title: "App", links: APP_LINKS },
        { title: "Resources", links: SIGNED_IN_RESOURCE_LINKS },
        { title: "Account", links: SIGNED_IN_ACCOUNT_LINKS },
      ]
    : [
        { title: "Product", links: PRODUCT_LINKS },
        { title: "Resources", links: RESOURCE_LINKS },
        { title: "Account", links: ACCOUNT_LINKS },
      ];

  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 sm:flex-row sm:justify-between">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-9 w-auto" />
            <span className="font-heading text-base font-bold tracking-tight">
              Academique
            </span>
          </Link>
          <p className="text-muted-foreground mt-3 max-w-xs text-sm">
            An AI-powered learning workspace for organising courses, notes and
            study material.
          </p>
        </div>

        <div className="flex flex-wrap gap-10 sm:gap-12">
          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-sm font-medium">{column.title}</p>
              <ul className="mt-3 space-y-2">
                {column.links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t">
        <p className="text-muted-foreground mx-auto w-full max-w-6xl px-6 py-4 text-xs">
          © {new Date().getFullYear()} Academique.
        </p>
      </div>
    </footer>
  );
}
