"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export function ProfileMenu() {
  const { data: session } = useSession();
  const name = session?.user?.name ?? "Account";
  return (
    <Link
      href="/hub"
      className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm hover:bg-muted dark:border-zinc-700"
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-vera-teal/20 text-xs font-semibold text-vera-teal">
        {name.charAt(0).toUpperCase()}
      </span>
      <span className="hidden sm:inline">{name}</span>
    </Link>
  );
}
