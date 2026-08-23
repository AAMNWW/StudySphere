import { FileText } from "lucide-react";

import { IconTile } from "@/components/icon-tile";
import { Card, CardContent } from "@/components/ui/card";
import type { ResumeModel } from "@/generated/prisma/models";
import { formatFileSize } from "@/lib/uploads";

import { DeleteResumeButton } from "./delete-resume-button";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export function ResumeRow({ resume }: { resume: ResumeModel }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        <IconTile color="blue" size="sm">
          <FileText className="size-4" />
        </IconTile>
        <div className="min-w-0 flex-1">
          <a
            href={`/api/resumes/${resume.id}`}
            className="truncate font-medium hover:underline"
          >
            {resume.title}
          </a>
          <p className="text-muted-foreground text-xs">
            {resume.fileName} · {formatFileSize(resume.sizeBytes)} · Added{" "}
            {dateFormatter.format(resume.createdAt)}
          </p>
        </div>
        <DeleteResumeButton resumeId={resume.id} resumeTitle={resume.title} />
      </CardContent>
    </Card>
  );
}
