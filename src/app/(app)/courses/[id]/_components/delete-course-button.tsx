"use client";

import { Button } from "@/components/ui/button";

import { deleteCourse } from "../../actions";

export function DeleteCourseButton({
  courseId,
  courseTitle,
}: {
  courseId: string;
  courseTitle: string;
}) {
  return (
    <form
      action={deleteCourse.bind(null, courseId)}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Delete "${courseTitle}"? This cannot be undone.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="destructive">
        Delete course
      </Button>
    </form>
  );
}
