"use client";

import { Plus, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useId, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMounted } from "@/lib/use-mounted";
import type { ResumeDraft } from "@/lib/validations/resume-builder";

import { draftResume, saveGeneratedResume } from "../actions";
import { ResumePreview } from "./resume-preview";

interface ExperienceFormEntry {
  key: string;
  title: string;
  company: string;
  dates: string;
  bulletsText: string;
}

interface EducationFormEntry {
  key: string;
  school: string;
  degree: string;
  dates: string;
}

interface ResumeFormState {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skillsText: string;
  experience: ExperienceFormEntry[];
  education: EducationFormEntry[];
}

const EMPTY_FORM: ResumeFormState = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  summary: "",
  skillsText: "",
  experience: [],
  education: [],
};

function newKey() {
  return Math.random().toString(36).slice(2);
}

/** The single source of truth for "what will actually be saved" — used by
 * both the live preview and handleSave, so the preview never drifts from
 * the PDF it's standing in for. */
function toResumeDraft(form: ResumeFormState): ResumeDraft {
  return {
    fullName: form.fullName,
    email: form.email,
    phone: form.phone,
    location: form.location,
    summary: form.summary,
    skills: form.skillsText
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean),
    experience: form.experience.map((entry) => ({
      title: entry.title,
      company: entry.company,
      dates: entry.dates,
      bullets: entry.bulletsText
        .split("\n")
        .map((bullet) => bullet.trim())
        .filter(Boolean),
    })),
    education: form.education.map((entry) => ({
      school: entry.school,
      degree: entry.degree,
      dates: entry.dates,
    })),
  };
}

// Everything here lives in plain React state with nothing saved anywhere
// else, so an accidental refresh, a closed tab, or a dev-server restart
// would otherwise silently wipe whatever the student had typed — this
// draft's the only copy until they hit Save. Persisting it to
// localStorage on every change (and restoring it on mount) means a
// refresh loses nothing; "Clear draft" is the explicit way to reset.
const DRAFT_STORAGE_KEY = "studysphere:resume-maker-draft";

interface StoredDraft {
  background: string;
  targetRole: string;
  title: string;
  form: ResumeFormState;
}

function loadDraft(): StoredDraft | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredDraft) : null;
  } catch {
    return null;
  }
}

function saveDraft(draft: StoredDraft) {
  try {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Private browsing / storage disabled / quota exceeded — the draft
    // just won't survive a refresh, nothing else depends on this.
  }
}

function clearDraft() {
  try {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // Same as above — best-effort only.
  }
}

export function ResumeMakerForm() {
  // useMounted flips true on the first client render after hydration
  // (see src/lib/use-mounted.ts) without an effect+setState of its own;
  // restoring a stored draft is a one-time adjustment triggered by that
  // flip, done inline during render (React's sanctioned pattern for this)
  // rather than in a useEffect, since a plain "setState in an effect on
  // mount" trips this repo's react-hooks/set-state-in-effect lint rule.
  const mounted = useMounted();
  const [background, setBackground] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [form, setForm] = useState<ResumeFormState>(EMPTY_FORM);
  const [title, setTitle] = useState("");
  const [draftError, setDraftError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDrafting, startDrafting] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const [hasRestored, setHasRestored] = useState(false);
  const [draftedJustNow, setDraftedJustNow] = useState(false);
  const idPrefix = useId();
  const previewRef = useRef<HTMLElement>(null);

  if (mounted && !hasRestored) {
    setHasRestored(true);
    const stored = loadDraft();
    if (stored) {
      setBackground(stored.background);
      setTargetRole(stored.targetRole);
      setTitle(stored.title);
      setForm(stored.form);
    }
  }

  // Skipped until the restore above has run, so it can't immediately
  // overwrite a stored draft with the initial empty state.
  useEffect(() => {
    if (!hasRestored) return;
    saveDraft({ background, targetRole, title, form });
  }, [hasRestored, background, targetRole, title, form]);

  function handleClearDraft() {
    setBackground("");
    setTargetRole("");
    setTitle("");
    setForm(EMPTY_FORM);
    setDraftError(null);
    setSaveError(null);
    clearDraft();
  }

  function handleDraft() {
    setDraftError(null);
    setDraftedJustNow(false);

    if (!background.trim()) {
      setDraftError("Paste some background above first.");
      return;
    }

    startDrafting(async () => {
      try {
        const draft = await draftResume(background, targetRole);
        // The AI only fills in what's actually in the background text — it
        // deliberately leaves contact fields blank rather than guess (see
        // draftResumeContent's prompt). Merge rather than replace, so a
        // blank AI field never blanks out something the student already
        // typed by hand; only non-empty AI output overwrites.
        setForm((prev) => ({
          fullName: draft.fullName || prev.fullName,
          email: draft.email || prev.email,
          phone: draft.phone || prev.phone,
          location: draft.location || prev.location,
          summary: draft.summary || prev.summary,
          skillsText: draft.skills.length > 0 ? draft.skills.join(", ") : prev.skillsText,
          experience:
            draft.experience.length > 0
              ? draft.experience.map((entry) => ({
                  key: newKey(),
                  title: entry.title,
                  company: entry.company,
                  dates: entry.dates,
                  bulletsText: entry.bullets.join("\n"),
                }))
              : prev.experience,
          education:
            draft.education.length > 0
              ? draft.education.map((entry) => ({
                  key: newKey(),
                  school: entry.school,
                  degree: entry.degree,
                  dates: entry.dates,
                }))
              : prev.education,
        }));
        if (!title) {
          setTitle(targetRole ? `${targetRole} Resume` : "AI Resume");
        }

        // The fields most likely to visibly change (summary, skills,
        // experience) are further down the page than Contact — and AI
        // deliberately never touches Full name/Email/Phone/Location, so
        // without this a draft that worked perfectly can look like it did
        // nothing if those top fields are what's in view. Scroll to the
        // preview so the result is immediately visible either way.
        setDraftedJustNow(true);
        previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (error) {
        setDraftError(error instanceof Error ? error.message : "Could not draft a resume.");
      }
    });
  }

  function handleSave() {
    setSaveError(null);
    startSaving(async () => {
      const result = await saveGeneratedResume(title, toResumeDraft(form));
      // saveGeneratedResume redirects on success, so only an error result
      // ever reaches here.
      if (result.status === "error") {
        setSaveError(result.message);
      }
    });
  }

  function addExperience() {
    setForm((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { key: newKey(), title: "", company: "", dates: "", bulletsText: "" },
      ],
    }));
  }

  function updateExperience(key: string, patch: Partial<ExperienceFormEntry>) {
    setForm((prev) => ({
      ...prev,
      experience: prev.experience.map((entry) => (entry.key === key ? { ...entry, ...patch } : entry)),
    }));
  }

  function removeExperience(key: string) {
    setForm((prev) => ({ ...prev, experience: prev.experience.filter((entry) => entry.key !== key) }));
  }

  function addEducation() {
    setForm((prev) => ({
      ...prev,
      education: [...prev.education, { key: newKey(), school: "", degree: "", dates: "" }],
    }));
  }

  function updateEducation(key: string, patch: Partial<EducationFormEntry>) {
    setForm((prev) => ({
      ...prev,
      education: prev.education.map((entry) => (entry.key === key ? { ...entry, ...patch } : entry)),
    }));
  }

  function removeEducation(key: string) {
    setForm((prev) => ({ ...prev, education: prev.education.filter((entry) => entry.key !== key) }));
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4 rounded-2xl border p-4">
        <div>
          <h2 className="font-bold">Draft with AI (optional)</h2>
          <p className="text-muted-foreground text-sm">
            Paste your work history, skills, and anything else relevant — AI will organize it
            into the fields below, which you can then edit freely.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-role`}>Target role (optional)</Label>
          <Input
            id={`${idPrefix}-role`}
            value={targetRole}
            onChange={(event) => setTargetRole(event.target.value)}
            placeholder="Frontend Engineer"
            maxLength={100}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-background`}>Background</Label>
          <Textarea
            id={`${idPrefix}-background`}
            value={background}
            onChange={(event) => setBackground(event.target.value)}
            placeholder="I'm a CS student who interned at... I know React, Python..."
            rows={6}
          />
        </div>

        {draftError ? (
          <p role="alert" className="text-destructive text-sm">
            {draftError}
          </p>
        ) : null}

        <Button type="button" variant="outline" onClick={handleDraft} disabled={isDrafting}>
          <Sparkles />
          {isDrafting ? "Drafting…" : "Draft with AI"}
        </Button>

        {draftedJustNow ? (
          <p role="status" className="text-sm text-emerald-600">
            Drafted — check the Preview below. It won&apos;t fill in your name/email/phone, so
            add those above by hand.
          </p>
        ) : null}
      </section>

      <section className="space-y-4">
        <h2 className="font-bold">Contact</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-name`}>Full name</Label>
            <Input
              id={`${idPrefix}-name`}
              value={form.fullName}
              onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
              maxLength={150}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-email`}>Email</Label>
            <Input
              id={`${idPrefix}-email`}
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              maxLength={150}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-phone`}>Phone</Label>
            <Input
              id={`${idPrefix}-phone`}
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              maxLength={50}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-location`}>Location</Label>
            <Input
              id={`${idPrefix}-location`}
              value={form.location}
              onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
              maxLength={150}
            />
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold">Summary</h2>
        <Textarea
          value={form.summary}
          onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))}
          rows={3}
          maxLength={2000}
        />
      </section>

      <section className="space-y-2">
        <h2 className="font-bold">Skills</h2>
        <Input
          value={form.skillsText}
          onChange={(event) => setForm((prev) => ({ ...prev, skillsText: event.target.value }))}
          placeholder="React, TypeScript, SQL, ..."
        />
        <p className="text-muted-foreground text-xs">Comma-separated.</p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Experience</h2>
          <Button type="button" variant="outline" size="sm" onClick={addExperience}>
            <Plus />
            Add role
          </Button>
        </div>

        {form.experience.map((entry) => (
          <div key={entry.key} className="space-y-3 rounded-xl border p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                placeholder="Title"
                value={entry.title}
                onChange={(event) => updateExperience(entry.key, { title: event.target.value })}
                maxLength={150}
              />
              <Input
                placeholder="Company"
                value={entry.company}
                onChange={(event) => updateExperience(entry.key, { company: event.target.value })}
                maxLength={150}
              />
            </div>
            <Input
              placeholder="Dates (e.g. Jun 2022 - Present)"
              value={entry.dates}
              onChange={(event) => updateExperience(entry.key, { dates: event.target.value })}
              maxLength={100}
            />
            <Textarea
              placeholder={"One bullet per line"}
              value={entry.bulletsText}
              onChange={(event) => updateExperience(entry.key, { bulletsText: event.target.value })}
              rows={4}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeExperience(entry.key)}
            >
              <Trash2 />
              Remove
            </Button>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Education</h2>
          <Button type="button" variant="outline" size="sm" onClick={addEducation}>
            <Plus />
            Add school
          </Button>
        </div>

        {form.education.map((entry) => (
          <div key={entry.key} className="space-y-3 rounded-xl border p-4">
            <Input
              placeholder="School"
              value={entry.school}
              onChange={(event) => updateEducation(entry.key, { school: event.target.value })}
              maxLength={150}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                placeholder="Degree"
                value={entry.degree}
                onChange={(event) => updateEducation(entry.key, { degree: event.target.value })}
                maxLength={150}
              />
              <Input
                placeholder="Dates"
                value={entry.dates}
                onChange={(event) => updateEducation(entry.key, { dates: event.target.value })}
                maxLength={100}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeEducation(entry.key)}
            >
              <Trash2 />
              Remove
            </Button>
          </div>
        ))}
      </section>

      <section ref={previewRef} className="space-y-3 scroll-mt-4">
        <h2 className="font-bold">Preview</h2>
        <ResumePreview draft={toResumeDraft(form)} />
      </section>

      <section className="sticky bottom-4 space-y-3 rounded-2xl border bg-background p-4 shadow-sm">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-title`}>Resume title</Label>
          <Input
            id={`${idPrefix}-title`}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Software Engineer Resume"
            maxLength={100}
          />
        </div>

        {!form.fullName ? (
          <p className="text-muted-foreground text-xs">Add a full name above to enable saving.</p>
        ) : null}

        {saveError ? (
          <p role="alert" className="text-destructive text-sm">
            {saveError}
          </p>
        ) : null}

        <div className="flex items-center gap-3">
          <Button type="button" onClick={handleSave} disabled={isSaving || !form.fullName}>
            {isSaving ? "Generating PDF…" : "Generate PDF & save as resume"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={handleClearDraft}>
            Clear draft
          </Button>
        </div>
        <p className="text-muted-foreground text-xs">
          Autosaved in this browser as you type — safe to refresh.
        </p>
      </section>
    </div>
  );
}
