"use client";

import Link from "next/link";
import { GlobalSearch } from "./GlobalSearch";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { MessagesDropdown } from "./MessagesDropdown";
import { QuickCreateMenu } from "./QuickCreateMenu";
import { ProfileMenu } from "./ProfileMenu";

export function TopNavBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-vera-4 px-vera-4">
        <Link
          href="/home"
          className="text-lg font-semibold tracking-tight text-vera-teal"
        >
          Verus
        </Link>
        <div className="hidden flex-1 md:block">
          <GlobalSearch />
        </div>
        <nav className="ml-auto flex items-center gap-vera-2">
          <QuickCreateMenu />
          <MessagesDropdown />
          <NotificationsDropdown />
          <ProfileMenu />
        </nav>
      </div>
    </header>
  );
}
