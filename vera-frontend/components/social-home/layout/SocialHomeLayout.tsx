"use client";

import type { ReactNode } from "react";
import { TopNavBar } from "./TopNavBar";
import { SidebarContainer } from "./SidebarContainer";

type Props = {
  children: ReactNode;
  sidebar?: ReactNode;
  leftNav?: ReactNode;
};

export function SocialHomeLayout({ children, sidebar, leftNav }: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground dark:bg-zinc-950 dark:text-zinc-50">
      <TopNavBar />
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-vera-6 px-vera-4 py-vera-6 lg:grid-cols-[220px_minmax(0,1fr)_300px]">
        <aside className="hidden lg:block">{leftNav}</aside>
        <main className="min-w-0">{children}</main>
        <aside className="hidden lg:block">
          <SidebarContainer>{sidebar}</SidebarContainer>
        </aside>
      </div>
    </div>
  );
}
