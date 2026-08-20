import { OfficeConverter, type SupportedFileType } from "officeparser";

import { ALLOWED_FILE_TYPES } from "@/lib/uploads";

export interface TextChunk {
  text: string;
  pageNumber?: number;
}

// 1000 characters per chunk with a 200-character overlap: the canonical
// "RAG 101" starting point — big enough to hold a coherent idea, small
// enough that a search result is actually about one thing, and the overlap
// means a sentence that straddles a chunk boundary still shows up whole in
// at least one chunk. Equivalent to LangChain's RecursiveCharacterTextSplitter.
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

/**
 * Splits a document's text into overlapping chunks for embedding. Works
 * uniformly across PDF/DOCX/PPTX — unlike src/lib/ai/document-content.ts
 * (which sends PDFs to Gemini as raw binary with no extraction), RAG needs
 * actual text to embed, so every format goes through the same extraction
 * path here.
 */
export async function chunkDocument(
  bytes: Buffer,
  mimeType: string,
  fileName: string,
): Promise<TextChunk[]> {
  const fileType = ALLOWED_FILE_TYPES[mimeType]?.extension as SupportedFileType | undefined;

  if (!fileType) {
    throw new Error(`Unsupported file type for chunking: ${mimeType}`);
  }

  const { value: chunks } = await OfficeConverter.convert(bytes, "chunks", {
    parseConfig: { fileType },
    generatorConfig: {
      chunksConfig: {
        strategy: "fixed-size",
        chunkSize: CHUNK_SIZE,
        chunkOverlap: CHUNK_OVERLAP,
      },
    },
  });

  const textChunks = chunks
    .map((chunk) => ({
      text: chunk.text.trim(),
      pageNumber: chunk.metadata.pageNumber,
    }))
    .filter((chunk) => chunk.text.length > 0);

  if (textChunks.length === 0) {
    throw new Error(`No extractable text found in "${fileName}".`);
  }

  return textChunks;
}
