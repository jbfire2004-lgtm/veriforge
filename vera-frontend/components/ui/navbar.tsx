"use client";

import Link from "next/link";
import { cn } from "@/src/lib/utils";

/**
 * In-module secondary links bar.
 * Does NOT replace Vera GlobalNav / ModuleNav — use only for page-local shortcuts.
 */
export function Navbar({
  items,
  className,
}: {
  items: { href: string; label: string; active?: boolean }[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Section"
      className={cn(
        "flex flex-wrap gap-2 border-b border-zinc-200 pb-3 text-sm",
        className,
      )}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "rounded px-2 py-1 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
            item.active && "bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
