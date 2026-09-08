import type { Metadata } from "next";
import { MailCheck } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { IconTile } from "@/components/icon-tile";

import { ResendVerificationForm } from "../../verify-email/_components/resend-verification-form";

export const metadata: Metadata = {
  title: "Check your email",
};

export default function CheckEmailPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-12">
      <Card>
        <CardHeader className="items-center text-center">
          <IconTile color="green">
            <MailCheck className="size-5" />
          </IconTile>
          <h1 className="font-heading mt-3 text-lg font-semibold">
            Check your email
          </h1>
          <p className="text-muted-foreground text-sm">
            We&apos;ve sent a confirmation link to the address you signed up
            with. Click it to activate your account, then sign in.
          </p>
        </CardHeader>
        <CardContent>
          <details className="text-muted-foreground text-sm">
            <summary className="cursor-pointer text-foreground">
              Didn&apos;t get it?
            </summary>
            <div className="mt-3">
              <ResendVerificationForm />
            </div>
          </details>
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
