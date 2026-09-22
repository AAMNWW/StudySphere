import type { Metadata } from "next";
import Link from "next/link";

import { AuthSplitLayout } from "@/components/auth-split-layout";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { OrDivider } from "@/components/or-divider";
import { isGoogleSignInOffered } from "@/lib/google-oauth";

import { LoginForm } from "./_components/login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

/** Auth.js redirects every failed sign-in to `pages.signIn` with `?error=`
 * (and Google's own OAuth errors arrive the same way), so without this the
 * page rendered as if nothing had happened — the reason "Continue with
 * Google" looked like a button that merely reloaded the page. Keys are
 * `AuthError.type` values; the raw code is shown alongside the message
 * because these are almost always a Google Cloud Console misconfiguration
 * that the code alone identifies. */
const SIGN_IN_ERRORS: Record<string, string> = {
  Configuration:
    "Sign-in isn't configured correctly on this server. Its Google credentials are missing or wrong.",
  AccessDenied:
    "Google wouldn't authorize this sign-in. If the app's OAuth consent screen is still in Testing, your account has to be added as a test user.",
  OAuthSignInError: "Couldn't start the Google sign-in. Please try again.",
  OAuthCallbackError:
    "Google redirected back with an error. The redirect URI registered in Google Cloud Console may not match this site's URL.",
  OAuthAccountNotLinked:
    "An account with this email already exists. Sign in with your password instead.",
  CallbackRouteError:
    "Sign-in failed while finishing up. Please try again.",
  Verification: "That sign-in link is invalid or has expired.",
  CredentialsSignin: "Invalid email or password.",
};

function signInErrorMessage(code: string): string {
  return (
    SIGN_IN_ERRORS[code] ??
    "Something went wrong signing you in. Please try again."
  );
}

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const { verified, error } = await searchParams;
  // searchParams values are `string | string[] | undefined`.
  const errorCode = Array.isArray(error) ? error[0] : error;

  return (
    <AuthSplitLayout
      photoSrc="/photos/study-outdoor.jpg"
      photoAlt="Three students studying together outside on campus, looking at a laptop"
      eyebrow="Welcome back"
      quote="Pick up right where you left off."
    >
      <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Welcome back to your study workspace.
      </p>

      <div className="mt-8">
        {errorCode ? (
          <div
            role="alert"
            className="mb-4 rounded-md border border-red-200 bg-red-50 px-3.5 py-3 dark:border-red-900 dark:bg-red-950/40"
          >
            <p className="text-sm text-red-700 dark:text-red-400">
              {signInErrorMessage(errorCode)}
            </p>
            <p className="mt-1 text-xs text-red-700/70 dark:text-red-400/70">
              Error code: {errorCode}
            </p>
          </div>
        ) : null}
        {verified ? (
          <p
            role="status"
            className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400"
          >
            Your email is verified. Sign in to continue.
          </p>
        ) : null}
        {/* Hidden entirely when GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET aren't
            configured: the divider goes with it, since "or continue with
            email" only makes sense when there is another option above. */}
        {isGoogleSignInOffered() ? (
          <>
            <GoogleSignInButton />
            <OrDivider label="or continue with email" />
          </>
        ) : null}
        <LoginForm />
        <p className="text-muted-foreground mt-6 text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-foreground font-medium underline underline-offset-4"
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}
