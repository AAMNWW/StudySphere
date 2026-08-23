import type { Metadata } from "next";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ResetPasswordForm } from "./_components/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password",
};

export default async function ResetPasswordPage({
  searchParams,
}: PageProps<"/reset-password">) {
  const { token } = await searchParams;
  const rawToken = typeof token === "string" ? token : null;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Set a new password</CardTitle>
          <CardDescription>
            Choose a new password for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rawToken ? (
            <ResetPasswordForm token={rawToken} />
          ) : (
            <p className="text-destructive text-sm">
              This link is missing its reset token. Request a new one from the{" "}
              <Link href="/forgot-password" className="underline underline-offset-4">
                forgot password
              </Link>{" "}
              page.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
