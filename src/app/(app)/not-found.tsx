import { Compass } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { IconTile } from "@/components/icon-tile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <Card className="w-full">
        <CardContent className="flex flex-col items-center gap-4 py-4">
          <IconTile color="gray" size="lg">
            <Compass className="size-6" />
          </IconTile>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Page not found</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              This page doesn&apos;t exist, or it may have been deleted.
            </p>
          </div>
          <Button nativeButton={false} render={<Link href="/">Back to dashboard</Link>} />
        </CardContent>
      </Card>
    </main>
  );
}
