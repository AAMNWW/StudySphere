import { looksLikeHtml, sanitizeNoteHtml } from "@/lib/sanitize-note";

// Notes created before the rich text editor was added stored plain text;
// notes created since store Tiptap's HTML output. Rendering plain text
// through dangerouslySetInnerHTML would mangle "<"/"&" characters a user
// typed literally, so only content that actually looks like HTML is
// rendered as HTML — everything else falls back to the old escaped-text
// rendering (see looksLikeHtml in src/lib/sanitize-note.ts).
export function NoteContent({ content }: { content: string }) {
  if (looksLikeHtml(content)) {
    return (
      <div
        className="tiptap text-sm"
        // Sanitized on render as well as on save: the save actions accept
        // any form input, not just what our Tiptap editor produces, and this
        // is also shown to read-only shared-course viewers
        // (src/app/(app)/shared/[token]/page.tsx).
        dangerouslySetInnerHTML={{ __html: sanitizeNoteHtml(content) }}
      />
    );
  }

  return <p className="text-sm whitespace-pre-wrap">{content}</p>;
}
