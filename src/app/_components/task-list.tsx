"use client";

import { Plus, X } from "lucide-react";
import { useRef, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { createTask, deleteTask, setTaskCompleted } from "../actions";

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
}

export function TaskList({ tasks }: { tasks: TaskItem[] }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="space-y-3">
      <form
        ref={formRef}
        action={(formData) => {
          startTransition(() => {
            createTask(formData);
          });
          formRef.current?.reset();
        }}
        className="flex gap-2"
      >
        <Input
          type="text"
          name="title"
          required
          maxLength={150}
          placeholder="Add a task…"
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={isPending} aria-label="Add task">
          <Plus />
        </Button>
      </form>

      {tasks.length === 0 ? (
        <p className="text-muted-foreground text-sm">No tasks yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {tasks.map((task) => (
            <li key={task.id} className="group flex items-center gap-2.5">
              <Checkbox
                checked={task.completed}
                onCheckedChange={(completed) => {
                  startTransition(() => {
                    setTaskCompleted(task.id, completed === true);
                  });
                }}
                aria-label={
                  task.completed
                    ? `Mark ${task.title} as not done`
                    : `Mark ${task.title} as done`
                }
              />
              <span
                className={cn(
                  "flex-1 truncate text-sm",
                  task.completed && "text-muted-foreground line-through",
                )}
              >
                {task.title}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${task.title}`}
                onClick={() => startTransition(() => deleteTask(task.id))}
                className="opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
