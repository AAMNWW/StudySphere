import { ChevronDown } from "lucide-react";

import { Reveal, RevealGroup, RevealItem } from "./reveal";

const FAQS = [
  {
    question: "Is Academique free?",
    answer: "Yes — every feature described on this page as available today is free to use.",
  },
  {
    question: "What can I upload?",
    answer: "PDF, Word (.docx) and PowerPoint (.pptx) files, up to 15MB each.",
  },
  {
    question: "Can I chat with my PDFs?",
    answer:
      "Yes — open any uploaded document and use the chat panel to ask questions about it. There's also a general AI tutor per course for questions that aren't tied to one document.",
  },
  {
    question: "How does the AI work?",
    answer:
      "For a summary, chat message, quiz or set of flashcards, the relevant document's content (or your question, for the AI tutor) is sent to Google's Gemini API, which generates the response.",
  },
  {
    question: "Can I use it for multiple subjects?",
    answer:
      "Yes — create as many courses as you need, each with its own notes, assignments and documents.",
  },
  {
    question: "Is my data private?",
    answer:
      "Your courses, notes, assignments and documents are only visible to your account. See the data section above for exactly what leaves the server and when.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="mx-auto w-full max-w-3xl px-6 py-16">
      <Reveal className="text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Frequently asked questions
        </h2>
      </Reveal>

      <RevealGroup className="mt-10 space-y-3" stagger={0.05}>
        {FAQS.map(({ question, answer }) => (
          <RevealItem key={question}>
            <details className="bg-card group rounded-2xl border border-black/5 p-4 shadow-sm sm:p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium marker:content-none">
                {question}
                <ChevronDown className="text-muted-foreground size-4 shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <p className="text-muted-foreground mt-3 text-sm">{answer}</p>
            </details>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
