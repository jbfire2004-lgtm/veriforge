"use client";

import type { ReactNode } from "react";

export function SidebarContainer({ children }: { children: ReactNode }) {
  return (
    <div className="sticky top-20 space-y-vera-4">{children}</div>
  );
}
