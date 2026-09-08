import { Target } from "lucide-react";

import { IconTile } from "@/components/icon-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { AtsCheckButton } from "./ats-check-button";

function scoreColorClasses(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-destructive";
}

export function AtsCheckCard({
  jobId,
  atsScore,
  atsFeedback,
  atsMatchedKeywords,
  atsMissingKeywords,
  atsError,
}: {
  jobId: string;
  atsScore: number | null;
  atsFeedback: string | null;
  atsMatchedKeywords: string[];
  atsMissingKeywords: string[];
  atsError: string | null;
}) {
  const hasResult = atsScore !== null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-3">
          <IconTile color="green" size="sm">
            <Target className="size-4" />
          </IconTile>
          <CardTitle>ATS Check</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Simulates how an Applicant Tracking System would score your linked resume against
          this job&apos;s description.
        </p>

        {hasResult ? (
          <div className="space-y-3">
            <p className={cn("text-3xl font-bold tabular-nums", scoreColorClasses(atsScore!))}>
              {atsScore}%
            </p>
            {atsFeedback ? <p className="text-sm">{atsFeedback}</p> : null}

            {atsMatchedKeywords.length > 0 ? (
              <div>
                <p className="mb-1.5 text-xs font-medium">Matched keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {atsMatchedKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {atsMissingKeywords.length > 0 ? (
              <div>
                <p className="mb-1.5 text-xs font-medium">Missing keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {atsMissingKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="bg-destructive/10 text-destructive rounded-full px-2 py-0.5 text-xs font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {atsError ? (
          <p role="alert" className="text-destructive text-sm">
            {atsError}
          </p>
        ) : null}

        <AtsCheckButton jobId={jobId} hasResult={hasResult} />
      </CardContent>
    </Card>
  );
}
