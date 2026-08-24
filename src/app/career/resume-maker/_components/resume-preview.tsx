import type { ResumeDraft } from "@/lib/validations/resume-builder";

/** Mirrors the PDF layout (src/lib/pdf/resume-pdf.tsx) closely enough to
 * preview it, so what's shown here before saving matches what comes out. */
export function ResumePreview({ draft }: { draft: ResumeDraft }) {
  const contactLine = [draft.email, draft.phone, draft.location].filter(Boolean).join("  ·  ");
  const isEmpty =
    !draft.fullName &&
    !draft.summary &&
    draft.skills.length === 0 &&
    draft.experience.length === 0 &&
    draft.education.length === 0;

  if (isEmpty) {
    return (
      <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
        Fill in the fields above (or draft with AI) to see a preview here.
      </p>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border bg-white p-8 text-neutral-900 shadow-sm">
      <div>
        <h3 className="text-xl font-bold">{draft.fullName || "Untitled"}</h3>
        {contactLine ? <p className="text-xs text-neutral-500">{contactLine}</p> : null}
      </div>

      {draft.summary ? (
        <div>
          <p className="mb-1 text-xs font-bold tracking-wide uppercase">Summary</p>
          <p className="text-sm leading-relaxed">{draft.summary}</p>
        </div>
      ) : null}

      {draft.skills.length > 0 ? (
        <div>
          <p className="mb-1.5 text-xs font-bold tracking-wide uppercase">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {draft.skills.map((skill, index) => (
              <span
                key={`${skill}-${index}`}
                className="rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {draft.experience.length > 0 ? (
        <div>
          <p className="mb-1.5 text-xs font-bold tracking-wide uppercase">Experience</p>
          <div className="space-y-3">
            {draft.experience.map((entry, index) => (
              <div key={index}>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold">{entry.title || "Untitled role"}</p>
                  <p className="text-xs text-neutral-500">{entry.dates}</p>
                </div>
                <p className="text-xs text-neutral-600">{entry.company}</p>
                {entry.bullets.length > 0 ? (
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-sm">
                    {entry.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {draft.education.length > 0 ? (
        <div>
          <p className="mb-1.5 text-xs font-bold tracking-wide uppercase">Education</p>
          <div className="space-y-2">
            {draft.education.map((entry, index) => (
              <div key={index} className="flex items-baseline justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{entry.school || "Untitled school"}</p>
                  <p className="text-xs text-neutral-600">{entry.degree}</p>
                </div>
                <p className="text-xs text-neutral-500">{entry.dates}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
