"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { EASE, useStill } from "./motion";
import { CtaButton, SectionHeading } from "./ui";

const FAQS: { question: string; answer: string }[] = [
  {
    question: "Is Academique free?",
    answer:
      "Yes. Everything described on this page as available today is free to use. No card, and no trial that quietly ends.",
  },
  {
    question: "What can I upload?",
    answer: "PDF, Word (.docx) and PowerPoint (.pptx) files, up to 15MB each.",
  },
  {
    question: "Can I chat with my PDFs?",
    answer:
      "Yes. Open any uploaded document and use the chat panel to ask questions about it. Each course also has a general AI tutor for questions that aren't tied to one document.",
  },
  {
    question: "How does the AI work?",
    answer:
      "For a summary, chat message, quiz or flashcard set, the relevant document's content (or your question, for the tutor) is sent to a large language model, which generates the response. Nothing is sent unless you ask for it.",
  },
  {
    question: "Can I use it for multiple subjects?",
    answer:
      "Yes. Create as many courses as you need, each with its own notes, documents, assignments, exams and topics.",
  },
  {
    question: "Does it handle anything beyond coursework?",
    answer:
      "It does. The career section adds a resume maker, ATS check, cover letter drafting, a job application tracker, mock interviews and a career chat.",
  },
  {
    question: "Is my data private?",
    answer:
      "Your courses, notes, assignments and documents are visible only to your account. The data section above spells out exactly what leaves the server, and when.",
  },
];

/** One row. Deliberately plain structure: a button, and an answer that grows
 * out from under it. The previous version nested a variant-driven stagger
 * around an `AnimatePresence` child that set its own `initial`/`animate`,
 * which cut the variant chain and left rows stuck in their hidden state. */
function FaqRow({
  question,
  answer,
  isOpen,
  onToggle,
  index,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  const still = useStill();

  return (
    <motion.div
      initial={still ? false : { opacity: 0, y: 16 }}
      whileInView={still ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.5, delay: index * 0.04, ease: EASE }}
      className={cn(
        "bg-card overflow-hidden rounded-2xl border shadow-sm transition-colors",
        isOpen ? "border-primary/30" : "border-black/5 dark:border-white/10",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
      >
        <span className="font-medium">{question}</span>
        <motion.span
          animate={still ? undefined : { rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
            isOpen
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          <Plus className="size-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            key="answer"
            initial={still ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={still ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="text-muted-foreground px-5 pb-5 text-sm sm:px-6 sm:pb-6">
              {answer}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export function FaqSection() {
  const [open, setOpen] = useState<string | null>(FAQS[0].question);

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-20"
    >
      <SectionHeading
        id="faq-heading"
        eyebrow="FAQ"
        title="Questions, answered."
      />

      <div className="mt-10 space-y-3">
        {FAQS.map((faq, index) => (
          <FaqRow
            key={faq.question}
            index={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={open === faq.question}
            onToggle={() => setOpen(open === faq.question ? null : faq.question)}
          />
        ))}
      </div>

      <div className="mt-10 flex flex-col items-center gap-3 text-center">
        <p className="text-muted-foreground text-sm">
          Still deciding? Setting up your first course takes about a minute.
        </p>
        <CtaButton href="/signup" arrow>
          Get started free
        </CtaButton>
      </div>
    </section>
  );
}
