"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { IconTile } from "@/components/icon-tile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <Card className="w-full">
        <CardContent className="flex flex-col items-center gap-4 py-4">
          <IconTile color="red" size="lg">
            <AlertTriangle className="size-6" />
          </IconTile>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Something went wrong</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              An unexpected error happened. You can try again, or head back to the dashboard.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => reset()}>
              Try again
            </Button>
            <Button nativeButton={false} render={<Link href="/">Back to dashboard</Link>} />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
