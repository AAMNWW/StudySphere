import { BarChart3, Clock4, ListChecks, Percent, TrendingDown } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { IconTile } from "@/components/icon-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";

import { AccuracyTrendChart } from "./_components/accuracy-trend-chart";
import { DifficultyBreakdownChart } from "./_components/difficulty-breakdown-chart";
import { WeakTopicsChart } from "./_components/weak-topics-chart";

const DIFFICULTY_ORDER: { value: string; label: string }[] = [
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
  { value: "PRO", label: "Pro" },
  { value: "MASTER", label: "Master" },
];

export async function generateMetadata({
  params,
}: PageProps<"/courses/[id]/analytics">): Promise<Metadata> {
  const userId = await requireUserId();
  const { id } = await params;
  const course = await db.course.findFirst({ where: { id, userId }, select: { title: true } });

  return { title: course ? `Analytics — ${course.title}` : "Course not found" };
}

export default async function AnalyticsPage({
  params,
}: PageProps<"/courses/[id]/analytics">) {
  const userId = await requireUserId();
  const { id: courseId } = await params;

  const course = await db.course.findFirst({ where: { id: courseId, userId } });

  if (!course) {
    notFound();
  }

  const [logs, studySessions] = await Promise.all([
    db.quizAnswerLog.findMany({
      where: { courseId, userId },
      select: { createdAt: true, isCorrect: true, topic: true, difficulty: true },
      orderBy: { createdAt: "asc" },
    }),
    db.studySession.findMany({
      where: { courseId, userId, endedAt: { not: null } },
      select: { startedAt: true, endedAt: true },
    }),
  ]);

  const studyMinutes = Math.round(
    studySessions.reduce(
      (total, session) => total + (session.endedAt!.getTime() - session.startedAt.getTime()),
      0,
    ) / 60_000,
  );
  const studyTimeLabel =
    studyMinutes >= 60
      ? `${Math.floor(studyMinutes / 60)}h ${studyMinutes % 60}m`
      : `${studyMinutes}m`;

  // Accuracy over time: group by UTC day.
  const byDay = new Map<string, { correct: number; total: number }>();
  for (const log of logs) {
    const key = log.createdAt.toISOString().slice(0, 10);
    const entry = byDay.get(key) ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (log.isCorrect) entry.correct += 1;
    byDay.set(key, entry);
  }
  const trend = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, ...v }));

  // Weakest topics: same shape as the study-planner agent's get_weak_topics
  // tool (src/lib/agent/tools.ts) — wrong-answer count per topic, top 10.
  const wrongByTopic = new Map<string, number>();
  for (const log of logs) {
    if (log.isCorrect || !log.topic) continue;
    wrongByTopic.set(log.topic, (wrongByTopic.get(log.topic) ?? 0) + 1);
  }
  const weakTopics = [...wrongByTopic.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([topic, count]) => ({ topic, count }));

  // Difficulty breakdown: correct/total per tier, in a fixed tier order.
  const byDifficulty = new Map<string, { correct: number; total: number }>();
  for (const log of logs) {
    const entry = byDifficulty.get(log.difficulty) ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (log.isCorrect) entry.correct += 1;
    byDifficulty.set(log.difficulty, entry);
  }
  const difficultyBreakdown = DIFFICULTY_ORDER.map(({ value, label }) => ({
    difficulty: value,
    label,
    ...(byDifficulty.get(value) ?? { correct: 0, total: 0 }),
  }));

  const totalAnswered = logs.length;
  const totalCorrect = logs.filter((l) => l.isCorrect).length;
  const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const topWeakTopic = weakTopics[0]?.topic ?? "—";

  return (
    <main className="max-w-3xl">
      <header className="mb-8 flex items-center gap-3">
        <IconTile color="purple">
          <BarChart3 className="size-5" />
        </IconTile>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground text-sm">
            How your quiz performance in {course.title} is trending.
          </p>
        </div>
      </header>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card size="sm">
          <CardContent className="flex items-center gap-3">
            <IconTile color="blue" size="sm">
              <Clock4 className="size-4" />
            </IconTile>
            <div>
              <p className="text-xl leading-none font-bold">{studyTimeLabel}</p>
              <p className="text-muted-foreground mt-1 text-xs">Study time</p>
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex items-center gap-3">
            <IconTile color="purple" size="sm">
              <ListChecks className="size-4" />
            </IconTile>
            <div>
              <p className="text-xl leading-none font-bold">{totalAnswered}</p>
              <p className="text-muted-foreground mt-1 text-xs">Questions answered</p>
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex items-center gap-3">
            <IconTile color="green" size="sm">
              <Percent className="size-4" />
            </IconTile>
            <div>
              <p className="text-xl leading-none font-bold">{overallAccuracy}%</p>
              <p className="text-muted-foreground mt-1 text-xs">Overall accuracy</p>
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex items-center gap-3">
            <IconTile color="red" size="sm">
              <TrendingDown className="size-4" />
            </IconTile>
            <div>
              <p className="truncate text-xl leading-none font-bold" title={topWeakTopic}>
                {topWeakTopic}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">Weakest topic</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Accuracy over time</CardTitle>
        </CardHeader>
        <CardContent>
          <AccuracyTrendChart data={trend} />
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Weakest topics</CardTitle>
        </CardHeader>
        <CardContent>
          <WeakTopicsChart data={weakTopics} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accuracy by difficulty</CardTitle>
        </CardHeader>
        <CardContent>
          <DifficultyBreakdownChart data={difficultyBreakdown} />
        </CardContent>
      </Card>
    </main>
  );
}
