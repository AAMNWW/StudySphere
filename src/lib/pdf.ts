import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import type { TextItem } from "pdfjs-dist/types/src/display/api";

// Gemini's document understanding caps out at 1000 pages per PDF regardless
// of file size — beyond that, the whole-document flow in document-content.ts
// requires a topic so it can extract just the relevant pages instead.
export const MAX_PDF_PAGES = 1000;

/** Counts a PDF's pages without rendering anything. Node-only (pulls in
 * pdfjs-dist's legacy build). */
export async function countPdfPages(bytes: Buffer): Promise<number> {
  const loadingTask = getDocument({ data: new Uint8Array(bytes) });

  try {
    const doc = await loadingTask.promise;
    return doc.numPages;
  } finally {
    await loadingTask.destroy();
  }
}

/** Extracts each page's plain text, index 0 = page 1. Node-only. */
export async function extractPdfPageTexts(bytes: Buffer): Promise<string[]> {
  const loadingTask = getDocument({ data: new Uint8Array(bytes) });

  try {
    const doc = await loadingTask.promise;
    const pages: string[] = [];

    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
      const page = await doc.getPage(pageNumber);
      const content = await page.getTextContent();
      const text = content.items
        .map((item) => ("str" in item ? (item as TextItem).str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      pages.push(text);
      page.cleanup();
    }

    return pages;
  } finally {
    await loadingTask.destroy();
  }
}
