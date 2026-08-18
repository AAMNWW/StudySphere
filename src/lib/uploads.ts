import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

// Local disk for now — see the file-storage decision in the auth/uploads
// planning conversation. Move this to object storage before deploying
// anywhere with more than one server instance or an ephemeral filesystem.
const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export const ALLOWED_FILE_TYPES: Record<
  string,
  { extension: "pdf" | "docx" | "pptx"; label: string }
> = {
  "application/pdf": { extension: "pdf", label: "PDF" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    { extension: "docx", label: "Word document" },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    { extension: "pptx", label: "PowerPoint presentation" },
};

/**
 * Writes an uploaded file under a per-course directory and returns the
 * random on-disk name it was stored as. The caller is responsible for
 * validating `file.type` against {@link ALLOWED_FILE_TYPES} and size
 * against {@link MAX_FILE_SIZE_BYTES} first.
 */
export async function saveUploadedFile(
  courseId: string,
  file: File,
): Promise<string> {
  const extension = ALLOWED_FILE_TYPES[file.type].extension;
  const storedName = `${randomUUID()}.${extension}`;

  const courseDir = path.join(UPLOAD_ROOT, courseId);
  await mkdir(courseDir, { recursive: true });

  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(courseDir, storedName), bytes);

  return storedName;
}

export function getUploadedFilePath(courseId: string, storedName: string) {
  return path.join(UPLOAD_ROOT, courseId, storedName);
}

/** Best-effort delete — a missing file on disk shouldn't fail the request. */
export async function deleteUploadedFile(
  courseId: string,
  storedName: string,
) {
  try {
    await unlink(getUploadedFilePath(courseId, storedName));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

export function formatFileSize(sizeBytes: number) {
  if (sizeBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
  }
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}
