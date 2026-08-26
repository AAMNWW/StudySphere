import { createPartFromBase64, type Part } from "@google/genai";
import { parseOffice } from "officeparser";

import { countPdfPages, extractPdfPageTexts, MAX_PDF_PAGES } from "@/lib/pdf";
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

/** Thrown for document-content problems that are safe and useful to show a
 * user verbatim (too many pages, no pages matched a topic) — as opposed to
 * a raw Gemini/network error, which callers should mask with a generic
 * message instead of leaking upstream error text. */
export class DocumentContentError extends Error {}

export async function getDocumentContent(
  bytes: Buffer,
  mimeType: string,
  fileName: string,
): Promise<DocumentContent> {
  if (mimeType === "application/pdf") {
    const pageCount = await countPdfPages(bytes);

    if (pageCount > MAX_PDF_PAGES) {
      throw new DocumentContentError(
        `"${fileName}" has ${pageCount} pages, more than the ${MAX_PDF_PAGES}-page limit ` +
          `for AI processing as a whole document. Focus the request on a topic or chapter ` +
          `so only the relevant pages need to be read.`,
      );
    }

    return {
      kind: "part",
      part: createPartFromBase64(bytes.toString("base64"), mimeType),
    };
  }

  const fileType = ALLOWED_FILE_TYPES[mimeType]?.extension;
  const ast = await parseOffice(bytes, { fileType });
  const text = ast.toText().trim();

  if (!text) {
    throw new DocumentContentError(`No extractable text found in "${fileName}".`);
  }

  return { kind: "text", text };
}

// How many pages of a too-long PDF to feed the model once we've narrowed
// down to a topic — generous enough to cover a full chapter plus surrounding
// context, small enough to keep the request well within Gemini's limits.
const RELEVANCE_PAGE_BUDGET = 200;
const RELEVANCE_CONTEXT_PAGES = 1;

function countOccurrences(haystack: string, needle: string): number {
  let count = 0;
  let index = haystack.indexOf(needle);

  while (index !== -1) {
    count++;
    index = haystack.indexOf(needle, index + needle.length);
  }

  return count;
}

function scorePagesByTopic(pages: string[], topic: string): number[] {
  const words = Array.from(
    new Set(
      topic
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length >= 3),
    ),
  );

  return pages.map((text) => {
    const lower = text.toLowerCase();
    return words.reduce((sum, word) => sum + countOccurrences(lower, word), 0);
  });
}

/** Pulls out just the pages of a large PDF that look relevant to `topic`
 * (plus a page of context around each match), instead of the whole book —
 * that's what lets a document past {@link MAX_PDF_PAGES} still be usable
 * when the request is scoped to a chapter or subject. */
async function extractTopicExcerpt(
  bytes: Buffer,
  topic: string,
  fileName: string,
): Promise<string> {
  const pages = await extractPdfPageTexts(bytes);
  const scores = scorePagesByTopic(pages, topic);
  const rankedMatches = scores
    .map((score, index) => ({ score, index }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  if (rankedMatches.length === 0) {
    throw new DocumentContentError(
      `Couldn't find pages matching "${topic}" in "${fileName}". Try a different topic or chapter name.`,
    );
  }

  const selected = new Set<number>();

  for (const { index } of rankedMatches) {
    if (selected.size >= RELEVANCE_PAGE_BUDGET) break;

    const start = Math.max(0, index - RELEVANCE_CONTEXT_PAGES);
    const end = Math.min(pages.length - 1, index + RELEVANCE_CONTEXT_PAGES);

    for (let page = start; page <= end; page++) {
      selected.add(page);
    }
  }

  return [...selected]
    .sort((a, b) => a - b)
    .map((index) => `[Page ${index + 1}]\n${pages[index]}`)
    .join("\n\n");
}

/**
 * Resolves several documents to Gemini-ready content in one call. PDFs pass
 * through as distinct `Part`s (Gemini already sees each as a separate
 * attachment); text-extracted files (DOCX/PPTX) are labeled with their
 * filename so a multi-document prompt stays attributable.
 *
 * A PDF over {@link MAX_PDF_PAGES} can't be sent as a whole document — with
 * a `topic`, only the matching pages (plus context) are extracted and sent
 * as labeled text instead; without one, it throws.
 */
export async function getDocumentsContent(
  documents: SourceDocument[],
  options: { topic?: string } = {},
): Promise<(string | Part)[]> {
  const parts: (string | Part)[] = [];

  for (const doc of documents) {
    if (doc.mimeType === "application/pdf") {
      const pageCount = await countPdfPages(doc.bytes);

      if (pageCount > MAX_PDF_PAGES) {
        if (!options.topic) {
          throw new DocumentContentError(
            `"${doc.fileName}" has ${pageCount} pages, more than the ${MAX_PDF_PAGES}-page ` +
              `limit for AI processing. Add a topic or chapter name to focus the request on ` +
              `part of it.`,
          );
        }

        const excerpt = await extractTopicExcerpt(doc.bytes, options.topic, doc.fileName);
        parts.push(
          `--- Document: ${doc.fileName} (excerpt matching "${options.topic}", from a ` +
            `${pageCount}-page document) ---\n${excerpt}`,
        );
        continue;
      }
    }

    const content = await getDocumentContent(doc.bytes, doc.mimeType, doc.fileName);
    parts.push(
      content.kind === "part"
        ? content.part
        : `--- Document: ${doc.fileName} ---\n${content.text}`,
    );
  }

  return parts;
}
