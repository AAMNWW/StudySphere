"use client";

import { Button } from "@/components/ui/button";

import { deleteUser } from "../actions";

export function DeleteUserButton({
  userId,
  userEmail,
}: {
  userId: string;
  userEmail: string;
}) {
  return (
    <form
      action={deleteUser.bind(null, userId)}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Delete "${userEmail}"? This removes their account and every course, document, note and assignment they have. This cannot be undone.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="destructive" size="sm">
        Delete
      </Button>
    </form>
  );
}
