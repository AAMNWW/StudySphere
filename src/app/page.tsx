import { redirect } from "next/navigation";

export default function Home() {
  // There is nothing to show at the root yet. Once authentication lands this
  // becomes a marketing page for signed-out visitors and a dashboard for
  // signed-in ones.
  redirect("/courses");
}
