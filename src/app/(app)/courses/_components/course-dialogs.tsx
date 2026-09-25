"use client";

import { Dialog } from "@base-ui/react/dialog";
import { MoreHorizontal, Pencil, Plus, Trash2, X } from "lucide-react";
import { useActionState, useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

import { createCourse, deleteCourse, updateCourse } from "../actions";
import { initialCourseFormState, type CourseFormState } from "../course-form-state";

type CourseFields = { id: string; title: string; description: string | null };

const POPUP_CLASS =
  "bg-popover text-popover-foreground fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-5 shadow-xl transition-[opacity,scale] duration-150 outline-none data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0";
const BACKDROP_CLASS =
  "fixed inset-0 z-50 bg-black/30 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0";

function DialogHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <Dialog.Title className="font-heading text-lg font-semibold">{title}</Dialog.Title>
        {description ? (
          <Dialog.Description className="text-muted-foreground text-sm">{description}</Dialog.Description>
        ) : null}
      </div>
      <Dialog.Close
        aria-label="Close"
        className="hover:bg-muted -mt-1 -mr-1 flex size-8 cursor-pointer items-center justify-center rounded-md"
      >
        <X className="size-4" />
      </Dialog.Close>
    </div>
  );
}

/** Title + description form shared by "New course" and "Edit course". Calls
 * `onSaved` once the Server Action reports success, so the dialog can close. */
function CourseForm({
  action,
  course,
  submitLabel,
  onSaved,
}: {
  action: (state: CourseFormState, formData: FormData) => Promise<CourseFormState>;
  course?: CourseFields;
  submitLabel: string;
  onSaved: () => void;
}) {
  const [state, formAction, isPending] = useActionState(action, initialCourseFormState);

  useEffect(() => {
    if (state.status === "success") onSaved();
    // `submission` changes on every save, so a second success also fires.
  }, [state.status, state.submission, onSaved]);

  const values = state.values ?? { title: course?.title ?? "", description: course?.description ?? "" };

  return (
    <form key={state.submission} action={formAction} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="course-title">Title</Label>
        <Input
          id="course-title"
          name="title"
          placeholder="Linear Algebra"
          defaultValue={values.title}
          maxLength={100}
          autoFocus
          aria-invalid={Boolean(state.errors?.title)}
        />
        {state.errors?.title ? <p className="text-destructive text-sm">{state.errors.title[0]}</p> : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="course-description">Description (optional)</Label>
        <Textarea
          id="course-description"
          name="description"
          rows={3}
          maxLength={500}
          placeholder="What this course covers, and what you want to get out of it."
          defaultValue={values.description}
        />
        {state.errors?.description ? (
          <p className="text-destructive text-sm">{state.errors.description[0]}</p>
        ) : null}
      </div>
      {state.message ? (
        <p role="alert" className="text-destructive text-sm">
          {state.message}
        </p>
      ) : null}
      <div className="flex justify-end gap-2">
        <Dialog.Close render={<Button type="button" variant="outline" />}>Cancel</Dialog.Close>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

/** The Courses page's "New course" button + dialog. */
export function NewCourseButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger render={<Button />}>
        <Plus />
        New course
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className={BACKDROP_CLASS} />
        <Dialog.Popup className={POPUP_CLASS}>
          <DialogHeader title="New course" description="Start with the subject you're studying right now." />
          {/* Remounted per open so the form starts empty each time. */}
          {open ? <CourseForm action={createCourse} submitLabel="Add course" onSaved={() => setOpen(false)} /> : null}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** The ⋯ menu on a course card: Edit (title/description) and Delete. Sits
 * above the card's stretched link (`relative z-10`). */
export function CourseCardMenu({ course }: { course: CourseFields }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialog, setDialog] = useState<"edit" | "delete" | null>(null);
  const [isDeleting, startDelete] = useTransition();

  return (
    <div className="relative z-10">
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger
          aria-label={`Options for ${course.title}`}
          className="hover:bg-muted text-muted-foreground flex size-8 cursor-pointer items-center justify-center rounded-md"
        >
          <MoreHorizontal className="size-4" />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-40 p-1">
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              setDialog("edit");
            }}
            className="hover:bg-muted flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm"
          >
            <Pencil className="text-muted-foreground size-4" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              setDialog("delete");
            }}
            className="text-destructive hover:bg-destructive/10 flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm"
          >
            <Trash2 className="size-4" />
            Delete
          </button>
        </PopoverContent>
      </Popover>

      <Dialog.Root open={dialog !== null} onOpenChange={(open) => !open && setDialog(null)}>
        <Dialog.Portal>
          <Dialog.Backdrop className={BACKDROP_CLASS} />
          <Dialog.Popup className={POPUP_CLASS}>
            {dialog === "edit" ? (
              <>
                <DialogHeader title="Edit course" />
                <CourseForm
                  action={updateCourse.bind(null, course.id)}
                  course={course}
                  submitLabel="Save changes"
                  onSaved={() => setDialog(null)}
                />
              </>
            ) : null}
            {dialog === "delete" ? (
              <>
                <DialogHeader
                  title={`Delete "${course.title}"?`}
                  description="This permanently deletes the course and everything in it — notes, documents, assignments, exams, quizzes, flashcards, chats and links. It can't be undone."
                />
                <div className="flex justify-end gap-2">
                  <Dialog.Close render={<Button type="button" variant="outline" />}>Cancel</Dialog.Close>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isDeleting}
                    onClick={() => startDelete(() => deleteCourse(course.id))}
                  >
                    {isDeleting ? "Deleting…" : "Delete course"}
                  </Button>
                </div>
              </>
            ) : null}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
