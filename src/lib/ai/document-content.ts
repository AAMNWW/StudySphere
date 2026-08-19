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
