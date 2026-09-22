/**
 * The Google OAuth client credentials, shared by the two independent Google
 * flows in this app: "Continue with Google" sign-in (src/auth.ts) and the
 * "Connect Google Calendar" integration (src/lib/google-calendar.ts). Both
 * use the same OAuth client from Google Cloud Console — only the requested
 * scopes and the redirect URI differ.
 *
 * Both are optional features, so this returns null rather than throwing when
 * the credentials are absent. `.env.example` ships GOOGLE_CLIENT_ID and
 * GOOGLE_CLIENT_SECRET as empty strings, which means an install that never
 * filled them in has them *present but blank* — passing those straight
 * through produced a redirect to Google with `client_id=` and a bare
 * "Error 401: invalid_client" page, with nothing in the app pointing at the
 * missing config. Every Google entry point gates on this instead.
 */
export type GoogleOAuthCredentials = {
  clientId: string;
  clientSecret: string;
};

export function googleOAuthCredentials(): GoogleOAuthCredentials | null {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    return null;
  }

  return { clientId, clientSecret };
}

export function isGoogleOAuthConfigured(): boolean {
  return googleOAuthCredentials() !== null;
}

/**
 * Whether the sign-in screens should offer "Continue with Google".
 *
 * Looser than `isGoogleOAuthConfigured()` on purpose, and only for that
 * button. A client ID on its own means the operator *intends* Google sign-in
 * to exist here — a half-filled `.env` (an ID with a blank secret, say)
 * shouldn't make the button silently vanish, because an install that looks
 * like it has no Google sign-in at all is harder to diagnose than one that
 * says why the attempt failed.
 *
 * Auth.js can't register the provider without both halves, so with a missing
 * secret the click comes back to /login?error=Configuration, which the login
 * page already renders as "Sign-in isn't configured correctly on this
 * server." That is the intended failure path.
 *
 * The Calendar integration keeps using the strict check: it has no equivalent
 * error screen to land on.
 */
export function isGoogleSignInOffered(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID?.trim());
}
