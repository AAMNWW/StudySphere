"use client";

import { Sparkles, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { deleteTopic } from "../actions";

interface TopicItem {
  id: string;
  title: string;
  description: string | null;
  source: string;
}

export function TopicCard({ courseId, topic }: { courseId: string; topic: TopicItem }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {topic.source === "AI" ? (
            <span
              title="Suggested by AI"
              className="text-muted-foreground inline-flex items-center gap-1 text-xs"
            >
              <Sparkles className="size-3" />
            </span>
          ) : null}
          <CardTitle>{topic.title}</CardTitle>
        </div>
        <CardAction>
          <form
            action={deleteTopic.bind(null, courseId, topic.id)}
            onSubmit={(event) => {
              if (!window.confirm(`Delete "${topic.title}"?`)) {
                event.preventDefault();
              }
            }}
          >
            <Button
              type="submit"
              variant="ghost"
              size="icon-sm"
              aria-label={`Delete ${topic.title}`}
            >
              <Trash2 />
            </Button>
          </form>
        </CardAction>
      </CardHeader>
      {topic.description ? (
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{topic.description}</p>
        </CardContent>
      ) : null}
    </Card>
  );
}
