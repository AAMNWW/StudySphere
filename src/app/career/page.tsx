import { Briefcase, FileText, Send, Trophy } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { IconTile } from "@/components/icon-tile";
import { Card, CardContent } from "@/components/ui/card";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Career",
};

export default async function CareerPage() {
  const userId = await requireUserId();

  const [resumeCount, totalApplications, appliedOrLater, offers] = await Promise.all([
    db.resume.count({ where: { userId } }),
    db.jobApplication.count({ where: { userId } }),
    db.jobApplication.count({
      where: { userId, status: { in: ["APPLIED", "INTERVIEWING", "OFFER", "REJECTED"] } },
    }),
    db.jobApplication.count({ where: { userId, status: "OFFER" } }),
  ]);

  const stats = [
    { label: "Resumes", value: resumeCount, icon: FileText, color: "blue" as const },
    { label: "Tracked jobs", value: totalApplications, icon: Briefcase, color: "purple" as const },
    { label: "Applied", value: appliedOrLater, icon: Send, color: "green" as const },
    { label: "Offers", value: offers, icon: Trophy, color: "yellow" as const },
  ];

  return (
    <main>
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Career</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Your resumes and job search, in one place.
        </p>
      </header>

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} size="sm">
            <CardContent className="flex items-center gap-3">
              <IconTile color={color} size="sm">
                <Icon className="size-4" />
              </IconTile>
              <div>
                <p className="text-xl leading-none font-bold">{value}</p>
                <p className="text-muted-foreground mt-1 text-xs">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/career/resumes" className="block h-full">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center gap-4">
              <IconTile color="blue">
                <FileText className="size-5" />
              </IconTile>
              <div>
                <p className="font-medium">Resumes</p>
                <p className="text-muted-foreground text-sm">Upload and manage your resumes.</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/career/jobs" className="block h-full">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center gap-4">
              <IconTile color="purple">
                <Briefcase className="size-5" />
              </IconTile>
              <div>
                <p className="font-medium">Job Tracker</p>
                <p className="text-muted-foreground text-sm">
                  Track applications from saved to offer.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </main>
  );
}
