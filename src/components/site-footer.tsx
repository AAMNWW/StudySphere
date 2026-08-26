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
  { href: "/#privacy", label: "Privacy" },
];

const ACCOUNT_LINKS = [
  { href: "/login", label: "Sign in" },
  { href: "/signup", label: "Start for free" },
];

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10 sm:flex-row sm:justify-between">
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
          <div>
            <p className="text-sm font-medium">Product</p>
            <ul className="mt-3 space-y-2">
              {PRODUCT_LINKS.map(({ href, label }) => (
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

          <div>
            <p className="text-sm font-medium">Resources</p>
            <ul className="mt-3 space-y-2">
              {RESOURCE_LINKS.map(({ href, label }) => (
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

          <div>
            <p className="text-sm font-medium">Account</p>
            <ul className="mt-3 space-y-2">
              {ACCOUNT_LINKS.map(({ href, label }) => (
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
        </div>
      </div>

      <div className="border-t">
        <p className="text-muted-foreground mx-auto w-full max-w-5xl px-6 py-4 text-xs">
          © {new Date().getFullYear()} Academique.
        </p>
      </div>
    </footer>
  );
}
