"use client";

import { ChatPanel, type ChatMessageItem } from "../../../_components/chat-panel";
import { sendDocumentChatMessage } from "../actions";

export function DocumentChat({
  courseId,
  documentId,
  fileName,
  messages,
}: {
  courseId: string;
  documentId: string;
  fileName: string;
  messages: ChatMessageItem[];
}) {
  return (
    <ChatPanel
      messages={messages}
      action={sendDocumentChatMessage.bind(null, courseId, documentId)}
      emptyHint={`Ask anything about ${fileName} — answers are grounded in this document.`}
    />
  );
}
