import type { Metadata } from "next";
import Link from "next/link";

import { AuthSplitLayout } from "@/components/auth-split-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { SignupForm } from "./_components/signup-form";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignupPage() {
  return (
    <AuthSplitLayout
      photoSrc="/photos/study-group.jpg"
      photoAlt="A group of students studying together around a table with notebooks and a laptop"
      quote="Better with everything — and everyone — in one place."
    >
      <Card>
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Start organising your courses, notes and assignments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
          <p className="text-muted-foreground mt-4 text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-foreground underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthSplitLayout>
  );
}
