"use client";

import type { ReactNode } from "react";
import Link from "next/link";

/** Primary / secondary actions for assembled SMS dashboards */
export function DashActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

export function DashPrimaryLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className="vs-btn vs-btn-primary no-underline">
      {children}
    </Link>
  );
}

export function DashGhostLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className="vs-btn no-underline">
      {children}
    </Link>
  );
}

export function DashExpand({
  open,
  children,
}: {
  open: boolean;
  children: ReactNode;
}) {
  return (
    <div className="vs-expand-panel" data-open={open ? "true" : "false"}>
      {children}
    </div>
  );
}
