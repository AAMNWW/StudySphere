/**
 * The app's own base URL, for building absolute links in emails (which have
 * no request context to derive one from). Deliberately not derived from the
 * incoming request's Host header — that's attacker-controlled input, and a
 * password-reset email is exactly the kind of link you don't want built
 * from an unverified value. `VERCEL_PROJECT_PRODUCTION_URL` is a Vercel
 * system env var (no configuration needed) naming the project's real
 * production domain.
 */
export function getSiteUrl(): string {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  return "http://localhost:3000";
}
