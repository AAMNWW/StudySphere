/** Public contact for privacy/terms questions and data-deletion requests.
 * Must match the "User support email" on the Google OAuth consent screen. */
export const LEGAL_CONTACT_EMAIL = "itxaamnatariq@gmail.com";

/** Shared shell for the static /privacy and /terms pages — readable
 * long-form text, reachable signed out (see the matcher in src/proxy.ts),
 * which Google's OAuth consent screen requires of both links. */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground mt-2 text-sm">Last updated {updated}</p>
      <div className="mt-8 space-y-4 text-sm leading-relaxed [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </main>
  );
}
