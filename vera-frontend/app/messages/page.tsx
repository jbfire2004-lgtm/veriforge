import { redirect } from "next/navigation";

/** Messages inbox is served through Hub activity until a dedicated inbox ships. */
export default function MessagesPage() {
  redirect("/hub/activity");
}
