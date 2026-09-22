import type { Metadata } from "next";
import Link from "next/link";

import { AuthSplitLayout } from "@/components/auth-split-layout";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { OrDivider } from "@/components/or-divider";
import { isGoogleSignInOffered } from "@/lib/google-oauth";

import { SignupForm } from "./_components/signup-form";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignupPage() {
  return (
    <AuthSplitLayout
      photoSrc="/photos/study-library-group.jpg"
      photoAlt="Four students studying together at a library table surrounded by books and notes"
      eyebrow="Free to start"
      quote="Better with everything, and everyone, in one place."
    >
      <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Start organising your courses, notes and assignments.
      </p>

      <div className="mt-8">
        {/* Hidden entirely when GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET aren't
            configured: the divider goes with it, since "or continue with
            email" only makes sense when there is another option above. */}
        {isGoogleSignInOffered() ? (
          <>
            <GoogleSignInButton />
            <OrDivider label="or continue with email" />
          </>
        ) : null}
        <SignupForm />
        <p className="text-muted-foreground mt-6 text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-foreground font-medium underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}
