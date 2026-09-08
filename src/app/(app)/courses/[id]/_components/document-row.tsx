import { FileText, MessageCircle } from "lucide-react";
import Link from "next/link";

import { IconTile, type IconTileColor } from "@/components/icon-tile";
import { Card, CardContent } from "@/components/ui/card";
import type { DocumentModel } from "@/generated/prisma/models";
import { ALLOWED_FILE_TYPES, formatFileSize } from "@/lib/uploads";

import { DeleteDocumentButton } from "./delete-document-button";
import { SummarizeDocumentButton } from "./summarize-document-button";

// Fixed locale and time zone so the server always renders the same string a
// user would see, regardless of where the server happens to run.
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "UTC",
});

const FILE_TYPE_COLORS: Record<string, IconTileColor> = {
  "application/pdf": "red",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "blue",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "yellow",
};

export function DocumentRow({
  courseId,
  document,
}: {
  courseId: string;
  document: DocumentModel;
}) {
  const typeLabel = ALLOWED_FILE_TYPES[document.mimeType]?.label ?? "File";

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <IconTile color={FILE_TYPE_COLORS[document.mimeType] ?? "gray"} size="sm">
            <FileText className="size-4" />
          </IconTile>
          <div className="min-w-0 flex-1">
            <a
              href={`/api/documents/${document.id}`}
              className="truncate font-medium hover:underline"
            >
              {document.fileName}
            </a>
            <p className="text-muted-foreground text-xs">
              {typeLabel} · {formatFileSize(document.sizeBytes)} · Added{" "}
              {dateFormatter.format(document.createdAt)}
            </p>
          </div>
          <DeleteDocumentButton
            courseId={courseId}
            documentId={document.id}
            fileName={document.fileName}
          />
        </div>

        {document.summary ? (
          <p className="text-muted-foreground border-l-2 pl-3 text-sm">
            {document.summary}
          </p>
        ) : null}

        {document.summaryError ? (
          <p role="alert" className="text-destructive text-xs">
            {document.summaryError}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <SummarizeDocumentButton
            courseId={courseId}
            documentId={document.id}
            hasSummary={Boolean(document.summary)}
          />
          <Link
            href={`/courses/${courseId}/documents/${document.id}`}
            className="text-muted-foreground inline-flex items-center gap-1.5 text-sm hover:underline"
          >
            <MessageCircle className="size-4" />
            Chat, quiz & flashcards
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
