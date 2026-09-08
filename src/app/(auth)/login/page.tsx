import type { Metadata } from "next";
import Link from "next/link";

import { AuthSplitLayout } from "@/components/auth-split-layout";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { OrDivider } from "@/components/or-divider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { LoginForm } from "./_components/login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const { verified } = await searchParams;

  return (
    <AuthSplitLayout
      photoSrc="/photos/study-outdoor.jpg"
      photoAlt="Three students studying together outside on campus, looking at a laptop"
      quote="Pick up right where you left off."
    >
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Welcome back to your study workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verified ? (
            <p
              role="status"
              className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
            >
              Your email is verified — sign in to continue.
            </p>
          ) : null}
          <GoogleSignInButton />
          <OrDivider label="or continue with email" />
          <LoginForm />
          <p className="text-muted-foreground mt-4 text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-foreground underline underline-offset-4"
            >
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthSplitLayout>
  );
}
