import { Bell, Palette, User as UserIcon } from "lucide-react";
import type { Metadata } from "next";

import { auth } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { IconTile } from "@/components/icon-tile";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";

import { ColorPalettePicker } from "./_components/color-palette-picker";
import { NotificationPreferencesToggle } from "./_components/notification-preferences-toggle";
import { ProfileForm } from "./_components/profile-form";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const userId = await requireUserId();
  const session = await auth();

  const user = await db.user.findUniqueOrThrow({
    where: { id: userId },
    select: { name: true, email: true, emailRemindersEnabled: true, colorPalette: true },
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:gap-8">
      <AppSidebar isAdmin={session?.user?.role === "ADMIN"} />
      <main className="min-w-0 max-w-2xl flex-1">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm">
            Customize how StudySphere AI looks and works for you.
          </p>
        </header>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <IconTile color="purple" size="sm">
                <Palette className="size-4" />
              </IconTile>
              <CardTitle>Appearance</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-medium">Mode</p>
              <ThemeToggle />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Theme</p>
              <p className="text-muted-foreground mb-3 text-xs">
                Changes the whole app&apos;s colors, not just buttons — pick whatever feels like
                you.
              </p>
              <ColorPalettePicker colorPalette={user.colorPalette} />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <IconTile color="blue" size="sm">
                <UserIcon className="size-4" />
              </IconTile>
              <CardTitle>Profile</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-sm">{user.email}</p>
            <ProfileForm name={user.name} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <IconTile color="yellow" size="sm">
                <Bell className="size-4" />
              </IconTile>
              <CardTitle>Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <NotificationPreferencesToggle enabled={user.emailRemindersEnabled} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
