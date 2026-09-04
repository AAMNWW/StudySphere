import DOMMatrixPolyfill from "@thednp/dommatrix";
import type { TextItem } from "pdfjs-dist/types/src/display/api";

// Gemini's document understanding caps out at 1000 pages per PDF regardless
// of file size — beyond that, the whole-document flow in document-content.ts
// requires a topic so it can extract just the relevant pages instead.
export const MAX_PDF_PAGES = 1000;

// Dynamically imported (not a static top-level import) so pdfjs-dist is only
// ever loaded when a PDF is actually being processed. Next.js bundles every
// "use server" action across the app into shared chunks; a static import
// here would have pulled pdfjs-dist's module-level `DOMMatrix` reference
// into that shared bundle and crashed *every* server action in production,
// not just PDF ones.
let pdfjs: typeof import("pdfjs-dist/legacy/build/pdf.mjs") | undefined;

async function loadPdfjs() {
  if (!pdfjs) {
    // pdfjs-dist's Node build touches `new DOMMatrix()` at module scope
    // (unconditionally, even for the page-count/text-extraction paths below
    // that never render anything) and otherwise falls back to getting one
    // from the optional `@napi-rs/canvas` — which repeatedly proved
    // unreliable to deploy on Vercel: it's a native binary, and Next's
    // bundler breaks its runtime binary resolution even with
    // serverExternalPackages, so it silently fails to load in the deployed
    // function ("Cannot find module '@napi-rs/canvas'") and pdfjs then
    // crashes with "DOMMatrix is not defined". Polyfilling with a pure-JS
    // implementation here sidesteps native-binary deployment entirely —
    // pdfjs only needs a spec-compliant constructor, not real canvas
    // rendering, for anything this app calls.
    if (typeof globalThis.DOMMatrix === "undefined") {
      (globalThis as unknown as { DOMMatrix: typeof DOMMatrixPolyfill }).DOMMatrix =
        DOMMatrixPolyfill;
    }
    pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    // Node has no native Worker for pdfjs-dist to use, so it falls back to
    // running the worker code on the main thread via a dynamic
    // `import(GlobalWorkerOptions.workerSrc)` — which defaults to the
    // relative specifier "./pdf.worker.mjs". Next.js's bundler (Turbopack in
    // dev, webpack in prod) rewrites that relative import's base to the
    // *compiled chunk's* location instead of pdfjs-dist's real package
    // directory, so the default fails with "Cannot find module
    // '.next/.../pdf.worker.mjs'". Pointing it at the bare package
    // specifier instead lets Node's normal module resolution find the real
    // file in node_modules regardless of where the bundler placed the chunk
    // that's doing the importing.
    pdfjs.GlobalWorkerOptions.workerSrc = "pdfjs-dist/legacy/build/pdf.worker.mjs";
  }
  return pdfjs;
}

/** Counts a PDF's pages without rendering anything. Node-only (pulls in
 * pdfjs-dist's legacy build). */
export async function countPdfPages(bytes: Buffer): Promise<number> {
  const { getDocument } = await loadPdfjs();
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
  const { getDocument } = await loadPdfjs();
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
