import sanitizeHtml from "sanitize-html";

/**
 * Note bodies are Tiptap HTML, rendered with dangerouslySetInnerHTML — to
 * their author and to anyone viewing a shared course. The editor only ever
 * produces the StarterKit schema, but the Server Actions that save notes
 * accept any form input, so a hand-crafted request could store a `<script>`
 * or `onerror=` payload. Everything is passed through this allowlist (the
 * StarterKit tags, nothing else) both when a note is saved and when it's
 * rendered, so rows saved before this existed are covered too.
 */
export function sanitizeNoteHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "h1", "h2", "h3", "h4", "h5", "h6",
      "strong", "b", "em", "i", "s", "u", "code", "pre", "blockquote",
      "ul", "ol", "li", "hr", "a",
    ],
    allowedAttributes: { a: ["href", "target", "rel"], ol: ["start"] },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow" }),
    },
  });
}

/** Legacy notes are plain text, rendered escaped rather than as HTML (see
 * NoteContent), so only content that looks like HTML is sanitized — running
 * plain text through the sanitizer would turn a typed "<" into "&lt;". */
export function looksLikeHtml(value: string): boolean {
  return /^\s*<[a-z][\s\S]*>/i.test(value);
}

export function sanitizeNoteContent(value: string): string {
  return looksLikeHtml(value) ? sanitizeNoteHtml(value) : value;
}
