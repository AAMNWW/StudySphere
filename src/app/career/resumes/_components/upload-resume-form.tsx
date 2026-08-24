"use client";

import { upload } from "@vercel/blob/client";
import { useActionState, useRef, useState, useTransition, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_BYTES, RESUME_MIME_TYPES } from "@/lib/uploads-shared";
import { resumeTitleSchema } from "@/lib/validations/resume";

import { finalizeResumeUpload, uploadResume } from "../actions";
import { initialResumeFormState } from "../resume-form-state";

const ACCEPT = ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export function UploadResumeForm({ blobEnabled }: { blobEnabled: boolean }) {
  // Blob storage lets the browser upload straight to Vercel Blob, bypassing
  // Vercel's ~4.5MB Function request-body cap entirely (only that cap, not
  // our own serverActions.bodySizeLimit config, was what turned a plain
  // ~6MB upload into a hard crash). Local dev without a Blob token falls
  // back to the original Server-Action-carries-the-bytes flow.
  if (blobEnabled) {
    return <BlobUploadForm />;
  }
  return <ServerActionUploadForm />;
}

function BlobUploadForm() {
  const titleInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [resetKey, setResetKey] = useState(0);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const titleParsed = resumeTitleSchema.safeParse(titleInputRef.current?.value ?? "");

    if (!titleParsed.success) {
      setError(titleParsed.error.issues[0]?.message ?? "Invalid title.");
      return;
    }

    const file = fileInputRef.current?.files?.[0];

    if (!file || file.size === 0) {
      setError("Choose a file to upload.");
      return;
    }

    if (!RESUME_MIME_TYPES.has(file.type)) {
      setError("Only PDF and Word (.docx) files are supported.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`Files must be ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB or smaller.`);
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        // Random name, never derived from the user-supplied file name —
        // matches the Document model's storedName convention in schema.prisma.
        const extension = ALLOWED_FILE_TYPES[file.type].extension;
        const pathname = `resumes/${crypto.randomUUID()}.${extension}`;

        const blob = await upload(pathname, file, {
          access: "public",
          handleUploadUrl: "/api/resumes/upload",
        });

        const result = await finalizeResumeUpload(titleParsed.data, {
          fileName: file.name,
          storedName: blob.pathname,
          storageUrl: blob.url,
          mimeType: file.type,
          sizeBytes: file.size,
        });

        if (result.status === "error") {
          setError(result.message);
          return;
        }

        // Remounts the form, which clears both fields.
        setResetKey((key) => key + 1);
      } catch {
        setError("Could not upload the resume. Please try again.");
      }
    });
  }

  return (
    <form key={resetKey} onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          ref={titleInputRef}
          id="title"
          name="title"
          placeholder="Software Engineer Resume"
          maxLength={100}
          aria-invalid={Boolean(error)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">File</Label>
        <Input ref={fileInputRef} id="file" name="file" type="file" accept={ACCEPT} />
        <p className="text-muted-foreground text-xs">PDF or Word (.docx), up to 15MB.</p>
      </div>

      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Uploading…" : "Upload resume"}
      </Button>
    </form>
  );
}

/** Local-dev fallback for when no Blob token is configured — routes bytes
 * through the Server Action to write to local disk, as before Blob support
 * existed. Vercel's Function body cap doesn't apply to `next dev`. */
function ServerActionUploadForm() {
  const [state, formAction, isPending] = useActionState(
    uploadResume,
    initialResumeFormState,
  );
  const [clientError, setClientError] = useState<string | null>(null);

  return (
    <form
      // Remounting after every submission clears both fields, whether the
      // upload succeeded or failed.
      key={state.submission}
      action={formAction}
      className="space-y-4"
      noValidate
      onSubmit={(event) => {
        const input = event.currentTarget.elements.namedItem("file");
        const file = input instanceof HTMLInputElement ? input.files?.[0] : undefined;

        if (file && file.size > MAX_FILE_SIZE_BYTES) {
          event.preventDefault();
          setClientError(
            `Files must be ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB or smaller.`,
          );
          return;
        }

        setClientError(null);
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="Software Engineer Resume"
          defaultValue={state.values?.title}
          maxLength={100}
          aria-invalid={Boolean(state.errors?.title)}
        />
        {state.errors?.title ? (
          <p className="text-destructive text-sm">{state.errors.title[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">File</Label>
        <Input id="file" name="file" type="file" accept={ACCEPT} />
        <p className="text-muted-foreground text-xs">PDF or Word (.docx), up to 15MB.</p>
      </div>

      {clientError ?? state.message ? (
        <p role="alert" className="text-destructive text-sm">
          {clientError ?? state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Uploading…" : "Upload resume"}
      </Button>
    </form>
  );
}
