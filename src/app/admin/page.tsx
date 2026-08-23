import { BookOpen, FileText, ShieldCheck, SquareStack, Users } from "lucide-react";
import type { Metadata } from "next";

import { AppSidebar } from "@/components/app-sidebar";
import { IconTile } from "@/components/icon-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

import { DeleteUserButton } from "./_components/delete-user-button";

export const metadata: Metadata = {
  title: "Admin",
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export default async function AdminPage() {
  const adminId = await requireAdmin();

  const [userCount, courseCount, documentCount, quizAnswerCount, users] = await Promise.all([
    db.user.count(),
    db.course.count(),
    db.document.count(),
    db.quizAnswerLog.count(),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { courses: true } },
      },
    }),
  ]);

  const stats = [
    { label: "Users", value: userCount, icon: Users, color: "purple" as const },
    { label: "Courses", value: courseCount, icon: BookOpen, color: "blue" as const },
    { label: "Documents", value: documentCount, icon: FileText, color: "green" as const },
    { label: "Quiz answers logged", value: quizAnswerCount, icon: SquareStack, color: "yellow" as const },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:gap-8">
      <AppSidebar isAdmin />
      <main className="min-w-0 flex-1">
        <header className="mb-8 flex items-center gap-3">
          <IconTile color="red">
            <ShieldCheck className="size-5" />
          </IconTile>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
            <p className="text-muted-foreground text-sm">App-wide usage and account management.</p>
          </div>
        </header>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
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

        <Card>
          <CardHeader>
            <CardTitle>
              {users.length} {users.length === 1 ? "user" : "users"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b text-xs">
                    <th className="pb-2 font-medium">Email</th>
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium">Courses</th>
                    <th className="pb-2 font-medium">Joined</th>
                    <th className="pb-2 font-medium">Role</th>
                    <th className="pb-2" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="py-2 pr-2">{user.email}</td>
                      <td className="py-2 pr-2">{user.name ?? "—"}</td>
                      <td className="py-2 pr-2 tabular-nums">{user._count.courses}</td>
                      <td className="py-2 pr-2 whitespace-nowrap">
                        {dateFormatter.format(user.createdAt)}
                      </td>
                      <td className="py-2 pr-2">{user.role === "ADMIN" ? "Admin" : "Student"}</td>
                      <td className="py-2 text-right">
                        {user.id === adminId ? null : (
                          <DeleteUserButton userId={user.id} userEmail={user.email} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
