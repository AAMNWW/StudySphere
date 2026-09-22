"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

import { AUTH_BUTTON_CLASS } from "@/components/auth-split-layout";
import { Button } from "@/components/ui/button";

/** "Continue with Google".
 *
 * Deliberately a client component calling `signIn` from `next-auth/react`
 * rather than a Server Action calling `signIn` from `@/auth`. Both ask Auth.js
 * for the same Google authorization URL, but they travel there differently:
 * the Server Action hands the Next client router a cross-origin redirect
 * (`X-Action-Redirect: https://accounts.google.com/…;push`), while this does
 * `window.location.href = url` — a plain browser navigation with no router
 * involved, which is the only one of the two that can't end with the click
 * appearing to do nothing at all.
 *
 * Sign-in only (see the Google provider config in src/auth.ts); Calendar
 * access is a separate connection flow from /settings.
 *
 * Call sites must gate on `isGoogleOAuthConfigured()`
 * (src/lib/google-oauth.ts): without GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET
 * the Google provider isn't registered at all, so this button would only lead
 * to an error page. */
export function GoogleSignInButton() {
  const [status, setStatus] = useState<"idle" | "pending" | "error">("idle");

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        className={AUTH_BUTTON_CLASS}
        disabled={status === "pending"}
        onClick={async () => {
          setStatus("pending");
          try {
            // Resolves by navigating away, so reaching any line after this
            // means the redirect didn't happen.
            await signIn("google", { callbackUrl: "/" });
          } catch {
            setStatus("error");
          }
        }}
      >
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.89c2.28-2.1 3.53-5.19 3.53-8.82Z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.89-3c-1.08.72-2.46 1.16-4.04 1.16-3.11 0-5.74-2.1-6.68-4.92H1.3v3.09C3.26 21.3 7.31 24 12 24Z"
          />
          <path
            fill="#FBBC05"
            d="M5.32 14.33A7.2 7.2 0 0 1 4.95 12c0-.81.14-1.6.37-2.33V6.58H1.3A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.3 5.42l4.02-3.09Z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.45-3.45C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.3 6.58l4.02 3.09C6.26 6.85 8.89 4.75 12 4.75Z"
          />
        </svg>
        {status === "pending" ? "Redirecting to Google…" : "Continue with Google"}
      </Button>
      {status === "error" ? (
        <p role="alert" className="text-destructive mt-2 text-sm">
          Couldn&apos;t reach Google to start sign-in. Check your connection and
          try again.
        </p>
      ) : null}
    </div>
  );
}
