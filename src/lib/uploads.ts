import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_BYTES } from "./uploads-shared";

// Local disk when running without Blob configured (plain local dev); Vercel
// Blob storage everywhere BLOB_READ_WRITE_TOKEN is set (production), since
// Vercel's filesystem is ephemeral and local disk wouldn't survive a deploy.
const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

export { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_BYTES };

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

export function blobStorageConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

// --- Trust boundary -------------------------------------------------------
// A Document/Resume row's storedName and storageUrl decide which bytes the
// server reads, serves and deletes. Rows are created from client-reported
// values in the direct-to-Blob upload flow, so both are re-checked every time
// they're used: a storageUrl must point into this app's own Blob store under
// the owner's folder (never an arbitrary URL — that would be SSRF), and a
// local storedName must be exactly the random name saveUploadedFile/
// saveResumeFile generate (never a path — "../../.env" would read secrets).

const STORED_NAME_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(pdf|docx|pptx)$/;
const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";

/** Blob path prefixes a course's documents can live under: the direct
 * browser upload path, and the older server-side upload path. */
export function documentBlobPrefixes(courseId: string): string[] {
  return [`documents/${courseId}/`, `${courseId}/`];
}

export const RESUME_BLOB_PREFIX = "resumes/";

export function isOwnBlobUrl(url: string, prefixes: string[]): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  if (parsed.protocol !== "https:" || !parsed.hostname.endsWith(BLOB_HOST_SUFFIX)) {
    return false;
  }

  const pathname = decodeURIComponent(parsed.pathname).replace(/^\//, "");
  return !pathname.includes("..") && prefixes.some((prefix) => pathname.startsWith(prefix));
}

function localUploadPath(directory: string[], storedName: string): string {
  if (!STORED_NAME_PATTERN.test(storedName)) {
    throw new Error("Refusing to use an invalid stored file name.");
  }
  return path.join(UPLOAD_ROOT, ...directory, storedName);
}

async function fetchOwnBlob(url: string, prefixes: string[]): Promise<Buffer> {
  if (!isOwnBlobUrl(url, prefixes)) {
    throw new Error("Refusing to fetch a file outside this app's storage.");
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch uploaded file (${response.status})`);
  }

  return Buffer.from(await response.arrayBuffer());
}

/**
 * Validates a file the browser says it uploaded straight to Blob, using
 * Blob's own record of it rather than anything the client reported: the URL
 * must be in this store under one of `prefixes`, and its real content type
 * and size must be allowed. Returns the values to save, or null to reject.
 */
export async function verifyClientUpload(
  url: unknown,
  prefixes: string[],
  allowedTypes: Iterable<string>,
): Promise<{ storedName: string; storageUrl: string; mimeType: string; sizeBytes: number } | null> {
  if (!blobStorageConfigured() || typeof url !== "string" || !isOwnBlobUrl(url, prefixes)) {
    return null;
  }

  const { head } = await import("@vercel/blob");
  const blob = await head(url).catch(() => null);

  if (
    !blob ||
    !isOwnBlobUrl(blob.url, prefixes) ||
    !new Set(allowedTypes).has(blob.contentType) ||
    blob.size > MAX_FILE_SIZE_BYTES
  ) {
    return null;
  }

  return {
    storedName: blob.pathname,
    storageUrl: blob.url,
    mimeType: blob.contentType,
    sizeBytes: blob.size,
  };
}

/** A client-reported original file name, kept only for display. */
export function cleanFileName(value: unknown): string {
  const name = typeof value === "string" ? value.trim().slice(0, 255) : "";
  return name || "file";
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

/** Reads an uploaded file's bytes back, regardless of storage backend. */
export async function readUploadedFile(document: UploadedFileRef): Promise<Buffer> {
  if (document.storageUrl) {
    return fetchOwnBlob(document.storageUrl, documentBlobPrefixes(document.courseId));
  }

  return readFile(localUploadPath([document.courseId], document.storedName));
}

/** Best-effort delete — a missing file shouldn't fail the request. */
export async function deleteUploadedFile(document: UploadedFileRef) {
  if (document.storageUrl) {
    if (!isOwnBlobUrl(document.storageUrl, documentBlobPrefixes(document.courseId))) {
      return;
    }
    const { del } = await import("@vercel/blob");
    await del(document.storageUrl).catch(() => {});
    return;
  }

  try {
    await unlink(localUploadPath([document.courseId], document.storedName));
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
    return fetchOwnBlob(resume.storageUrl, [RESUME_BLOB_PREFIX]);
  }

  return readFile(localUploadPath(["resumes", resume.userId], resume.storedName));
}

/** Best-effort delete — a missing file shouldn't fail the request. */
export async function deleteResumeFile(resume: UploadedResumeRef) {
  if (resume.storageUrl) {
    if (!isOwnBlobUrl(resume.storageUrl, [RESUME_BLOB_PREFIX])) {
      return;
    }
    const { del } = await import("@vercel/blob");
    await del(resume.storageUrl).catch(() => {});
    return;
  }

  try {
    await unlink(localUploadPath(["resumes", resume.userId], resume.storedName));
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
