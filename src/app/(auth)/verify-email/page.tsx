import type { Metadata } from "next";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ResendVerificationForm } from "./_components/resend-verification-form";

export const metadata: Metadata = {
  title: "Verify your email",
};

export default async function VerifyEmailPage({
  searchParams,
}: PageProps<"/verify-email">) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            {error === "expired"
              ? "That link has expired. Enter your email and we'll send a new one."
              : "Enter your email and we'll send you a new verification link."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResendVerificationForm />
          <p className="text-muted-foreground mt-4 text-sm">
            <Link
              href="/login"
              className="text-foreground underline underline-offset-4"
            >
              Back to sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
