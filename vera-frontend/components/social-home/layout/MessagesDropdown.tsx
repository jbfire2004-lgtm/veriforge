"use client";

import Link from "next/link";

export function MessagesDropdown() {
  return (
    <Link
      href="/hub/activity"
      className="rounded-full px-3 py-2 text-sm text-muted-foreground hover:bg-muted dark:hover:bg-zinc-800"
    >
      Messages
    </Link>
  );
}
