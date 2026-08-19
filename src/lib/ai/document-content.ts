import { createPartFromBase64, type Part } from "@google/genai";
import { parseOffice } from "officeparser";

import { ALLOWED_FILE_TYPES } from "@/lib/uploads";

/**
 * PDFs are sent to Gemini directly — its document vision only meaningfully
 * understands PDFs, so DOCX/PPTX are extracted to plain text locally with
 * officeparser first and sent as a text prompt instead.
 */
export type DocumentContent =
  | { kind: "part"; part: Part }
  | { kind: "text"; text: string };

export interface SourceDocument {
  bytes: Buffer;
  mimeType: string;
  fileName: string;
}

export async function getDocumentContent(
  bytes: Buffer,
  mimeType: string,
  fileName: string,
): Promise<DocumentContent> {
  if (mimeType === "application/pdf") {
    return {
      kind: "part",
      part: createPartFromBase64(bytes.toString("base64"), mimeType),
    };
  }

  const fileType = ALLOWED_FILE_TYPES[mimeType]?.extension;
  const ast = await parseOffice(bytes, { fileType });
  const text = ast.toText().trim();

  if (!text) {
    throw new Error(`No extractable text found in "${fileName}".`);
  }

  return { kind: "text", text };
}

/**
 * Resolves several documents to Gemini-ready content in one call. PDFs pass
 * through as distinct `Part`s (Gemini already sees each as a separate
 * attachment); text-extracted files (DOCX/PPTX) are labeled with their
 * filename so a multi-document prompt stays attributable.
 */
export async function getDocumentsContent(
  documents: SourceDocument[],
): Promise<(string | Part)[]> {
  const parts: (string | Part)[] = [];

  for (const doc of documents) {
    const content = await getDocumentContent(doc.bytes, doc.mimeType, doc.fileName);
    parts.push(
      content.kind === "part"
        ? content.part
        : `--- Document: ${doc.fileName} ---\n${content.text}`,
    );
  }

  return parts;
}
