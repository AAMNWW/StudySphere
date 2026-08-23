import { CareerSidebar } from "@/components/career-sidebar";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function CareerLayout({
  children,
}: LayoutProps<"/career">) {
  const userId = await requireUserId();

  const [resumes, jobApplications] = await Promise.all([
    db.resume.count({ where: { userId } }),
    db.jobApplication.count({ where: { userId } }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:gap-8">
      <CareerSidebar counts={{ resumes, jobApplications }} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
