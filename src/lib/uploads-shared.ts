/** File-upload constants shared between server code and client components.
 * Kept in its own module (no `node:*` imports) so client bundles can import
 * it directly — unlike src/lib/uploads.ts, which pulls in node:fs/node:crypto
 * and would break if imported from a "use client" file. */

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

// A resume is never a slide deck — narrower than the course Documents'
// ALLOWED_FILE_TYPES, which also accepts .pptx.
export const RESUME_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
