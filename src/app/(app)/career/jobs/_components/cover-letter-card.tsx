import { Mail } from "lucide-react";

import { IconTile } from "@/components/icon-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { CopyCoverLetterButton } from "./copy-cover-letter-button";
import { CoverLetterButton } from "./cover-letter-button";

export function CoverLetterCard({
  jobId,
  coverLetter,
  coverLetterError,
}: {
  jobId: string;
  coverLetter: string | null;
  coverLetterError: string | null;
}) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-3">
          <IconTile color="pink" size="sm">
            <Mail className="size-4" />
          </IconTile>
          <CardTitle>Cover Letter</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Drafted from your linked resume and this job&apos;s details — review before sending,
          it won&apos;t invent experience you don&apos;t have but it also won&apos;t sound
          exactly like you yet.
        </p>

        {coverLetter ? (
          <div className="space-y-2">
            <div className="bg-muted/40 rounded-xl border p-4 text-sm whitespace-pre-wrap">
              {coverLetter}
            </div>
            <CopyCoverLetterButton text={coverLetter} />
          </div>
        ) : null}

        {coverLetterError ? (
          <p role="alert" className="text-destructive text-sm">
            {coverLetterError}
          </p>
        ) : null}

        <CoverLetterButton jobId={jobId} hasResult={Boolean(coverLetter)} />
      </CardContent>
    </Card>
  );
}
