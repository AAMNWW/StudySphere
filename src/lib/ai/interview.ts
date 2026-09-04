import { createUserContent, type Content, type Part } from "@google/genai";

import { getClient, MODEL, withGeminiRetry } from "./client";
import { getDocumentsContent, type SourceDocument } from "./document-content";
import { requireText } from "./summarize-document";

export interface InterviewTurn {
  role: "user" | "assistant";
  content: string;
}

function interviewerSystemPrompt(role: string, company: string | null): string {
  const companyClause = company ? ` at ${company}` : "";

  return (
    `You are conducting a realistic mock job interview for the role of "${role}"${companyClause}. ` +
    "Act as a professional, courteous interviewer: ask one question at a time, wait for the " +
    "candidate's answer, and ask natural follow-up questions based on what they say — mix " +
    "behavioral and role-specific technical or situational questions as the conversation " +
    "progresses. Keep each turn focused: one question, at most a couple of sentences, no " +
    "preamble. Do not reveal scoring or feedback during the interview — that comes at the end. " +
    "Open with a brief greeting and your first question."
  );
}

function turnsToContents(history: InterviewTurn[]): Content[] {
  return history.map((turn) => ({
    role: turn.role === "user" ? "user" : "model",
    parts: [{ text: turn.content }],
  }));
}

/**
 * Answers one turn of a mock interview — either the opening question (when
 * `history` is empty) or a follow-up reacting to the candidate's latest
 * answer. Same stateless-per-request streaming shape as
 * src/lib/ai/chat.ts's answerChatMessageStream: the full grounding and
 * history are resent every call.
 */
export async function* answerInterviewMessageStream(
  role: string,
  company: string | null,
  resume: SourceDocument | null,
  history: InterviewTurn[],
  candidateMessage: string,
): AsyncGenerator<string> {
  const ai = getClient();

  const groundingParts: (string | Part)[] = [interviewerSystemPrompt(role, company)];

  if (resume) {
    groundingParts.push("The candidate's resume, for context on their background:");
    groundingParts.push(...(await getDocumentsContent([resume])));
  }

  const contents: Content[] = [
    createUserContent(groundingParts),
    { role: "model", parts: [{ text: "Understood. I'll begin the interview now." }] },
    ...turnsToContents(history),
    createUserContent([candidateMessage]),
  ];

  const stream = await withGeminiRetry(() =>
    ai.models.generateContentStream({ model: MODEL, contents }),
  );

  for await (const chunk of stream) {
    if (chunk.text) yield chunk.text;
  }
}

/**
 * Generates the interviewer's opening greeting and first question when a
 * session is created. A blocking (non-streamed) call, since it runs inside
 * the create Server Action before redirecting to the session page — same
 * pattern as generateJobCoverLetter blocking on create.
 */
export async function startInterview(
  role: string,
  company: string | null,
  resume: SourceDocument | null,
): Promise<string> {
  const ai = getClient();

  const groundingParts: (string | Part)[] = [interviewerSystemPrompt(role, company)];

  if (resume) {
    groundingParts.push("The candidate's resume, for context on their background:");
    groundingParts.push(...(await getDocumentsContent([resume])));
  }

  const contents: Content[] = [
    createUserContent(groundingParts),
    { role: "model", parts: [{ text: "Understood. I'll begin the interview now." }] },
    createUserContent(["Please begin the interview with your greeting and first question."]),
  ];

  const response = await withGeminiRetry(() =>
    ai.models.generateContent({ model: MODEL, contents }),
  );
  return requireText(response);
}

/**
 * Generates wrap-up feedback once the student ends the session: a plain,
 * blocking call (not streamed) since it's a one-shot summary shown after
 * the interview is over, not part of the live back-and-forth.
 */
export async function generateInterviewFeedback(
  role: string,
  company: string | null,
  transcript: InterviewTurn[],
): Promise<string> {
  const ai = getClient();
  const companyClause = company ? ` at ${company}` : "";

  const transcriptText = transcript
    .map((turn) => `${turn.role === "assistant" ? "Interviewer" : "Candidate"}: ${turn.content}`)
    .join("\n\n");

  const prompt =
    `You just conducted a mock interview for the role of "${role}"${companyClause}. Based on ` +
    "the transcript below, give the candidate constructive wrap-up feedback: what they did " +
    "well, what to improve, and 2-3 concrete, actionable suggestions. Be encouraging but " +
    "honest. Keep it to a few short paragraphs.\n\nTranscript:\n" +
    transcriptText;

  const response = await withGeminiRetry(() =>
    ai.models.generateContent({ model: MODEL, contents: prompt }),
  );
  return requireText(response);
}
