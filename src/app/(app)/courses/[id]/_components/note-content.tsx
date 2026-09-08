// Notes created before the rich text editor was added stored plain text;
// notes created since store Tiptap's HTML output. Rendering plain text
// through dangerouslySetInnerHTML would mangle "<"/"&" characters a user
// typed literally, so only content that actually looks like HTML is
// rendered as HTML — everything else falls back to the old escaped-text
// rendering.
function looksLikeHtml(value: string): boolean {
  return /^\s*<[a-z][\s\S]*>/i.test(value);
}

export function NoteContent({ content }: { content: string }) {
  if (looksLikeHtml(content)) {
    return (
      <div
        className="tiptap text-sm"
        // Safe here regardless of viewer: this HTML was produced by our own
        // Tiptap editor (a fixed schema, not arbitrary markup) — never
        // attacker-controlled, whether rendered back to the author or to a
        // read-only shared-course viewer (src/app/shared/[token]/page.tsx).
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return <p className="text-sm whitespace-pre-wrap">{content}</p>;
}
