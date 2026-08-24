import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

// Local disk when running without Blob configured (plain local dev); Vercel
// Blob storage everywhere BLOB_READ_WRITE_TOKEN is set (production), since
// Vercel's filesystem is ephemeral and local disk wouldn't survive a deploy.
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

export interface StoredFile {
  storedName: string;
  /** Public Blob URL when stored in Vercel Blob; null when stored on local disk. */
  storageUrl: string | null;
}

/** The subset of a Document row needed to locate its bytes, regardless of
 * which storage backend it was saved under. */
export interface UploadedFileRef {
  courseId: string;
  storedName: string;
  storageUrl: string | null;
}

function blobStorageConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * Writes an uploaded file to Vercel Blob (when configured) or a per-course
 * local directory otherwise, and returns the random name it was stored as
 * plus its Blob URL if applicable. The caller is responsible for validating
 * `file.type` against {@link ALLOWED_FILE_TYPES} and size against
 * {@link MAX_FILE_SIZE_BYTES} first.
 */
export async function saveUploadedFile(
  courseId: string,
  file: File,
): Promise<StoredFile> {
  const extension = ALLOWED_FILE_TYPES[file.type].extension;
  const storedName = `${randomUUID()}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  if (blobStorageConfigured()) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`${courseId}/${storedName}`, bytes, {
      access: "public",
      contentType: file.type,
    });
    return { storedName, storageUrl: blob.url };
  }

  const courseDir = path.join(UPLOAD_ROOT, courseId);
  await mkdir(courseDir, { recursive: true });
  await writeFile(path.join(courseDir, storedName), bytes);

  return { storedName, storageUrl: null };
}

export function getUploadedFilePath(courseId: string, storedName: string) {
  return path.join(UPLOAD_ROOT, courseId, storedName);
}

/** Reads an uploaded file's bytes back, regardless of storage backend. */
export async function readUploadedFile(document: UploadedFileRef): Promise<Buffer> {
  if (document.storageUrl) {
    const response = await fetch(document.storageUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch uploaded file (${response.status})`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  return readFile(getUploadedFilePath(document.courseId, document.storedName));
}

/** Best-effort delete — a missing file shouldn't fail the request. */
export async function deleteUploadedFile(document: UploadedFileRef) {
  if (document.storageUrl) {
    const { del } = await import("@vercel/blob");
    await del(document.storageUrl).catch(() => {});
    return;
  }

  try {
    await unlink(getUploadedFilePath(document.courseId, document.storedName));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

/** The subset of a Resume row needed to locate its bytes — same shape as
 * {@link UploadedFileRef}, just keyed by userId instead of courseId, since
 * a resume isn't scoped to a course. */
export interface UploadedResumeRef {
  userId: string;
  storedName: string;
  storageUrl: string | null;
}

/** Resume equivalent of {@link saveUploadedFile} — same storage backend
 * and validation contract, namespaced by userId under `uploads/resumes/`
 * rather than by courseId, so a resume's directory never collides with a
 * course id. */
export async function saveResumeFile(userId: string, file: File): Promise<StoredFile> {
  const extension = ALLOWED_FILE_TYPES[file.type].extension;
  const storedName = `${randomUUID()}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const namespace = `resumes/${userId}`;

  if (blobStorageConfigured()) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`${namespace}/${storedName}`, bytes, {
      access: "public",
      contentType: file.type,
    });
    return { storedName, storageUrl: blob.url };
  }

  const resumeDir = path.join(UPLOAD_ROOT, namespace);
  await mkdir(resumeDir, { recursive: true });
  await writeFile(path.join(resumeDir, storedName), bytes);

  return { storedName, storageUrl: null };
}

/** Resume-maker equivalent of {@link saveResumeFile} for bytes generated
 * server-side (a rendered PDF) rather than an uploaded File — same
 * storage backend and namespace, always stored as .pdf. */
export async function saveResumeBytes(userId: string, bytes: Buffer): Promise<StoredFile> {
  const storedName = `${randomUUID()}.pdf`;
  const namespace = `resumes/${userId}`;

  if (blobStorageConfigured()) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`${namespace}/${storedName}`, bytes, {
      access: "public",
      contentType: "application/pdf",
    });
    return { storedName, storageUrl: blob.url };
  }

  const resumeDir = path.join(UPLOAD_ROOT, namespace);
  await mkdir(resumeDir, { recursive: true });
  await writeFile(path.join(resumeDir, storedName), bytes);

  return { storedName, storageUrl: null };
}

export async function readResumeFile(resume: UploadedResumeRef): Promise<Buffer> {
  if (resume.storageUrl) {
    const response = await fetch(resume.storageUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch uploaded file (${response.status})`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  return readFile(path.join(UPLOAD_ROOT, "resumes", resume.userId, resume.storedName));
}

/** Best-effort delete — a missing file shouldn't fail the request. */
export async function deleteResumeFile(resume: UploadedResumeRef) {
  if (resume.storageUrl) {
    const { del } = await import("@vercel/blob");
    await del(resume.storageUrl).catch(() => {});
    return;
  }

  try {
    await unlink(path.join(UPLOAD_ROOT, "resumes", resume.userId, resume.storedName));
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
