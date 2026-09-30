"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { navChrome } from "@/src/components/navigation/nav-chrome";

export type SidebarGroupProps = {
  label: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
};

/** Graphite sidebar section with clear industrial hierarchy. */
export function SidebarGroup({
  label,
  children,
  collapsible,
  defaultOpen = true,
  className,
}: SidebarGroupProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <section className={cn("space-y-1", className)} aria-label={label}>
      {collapsible ? (
        <button
          type="button"
          className={cn(
            "flex w-full items-center justify-between px-3 py-2",
            navChrome.sideSectionLabel,
            "w-full text-left hover:text-[#F4F6F8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8]",
          )}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {label}
          <ChevronDown
            className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
            aria-hidden
          />
        </button>
      ) : (
        <p className={navChrome.sideSectionLabel}>{label}</p>
      )}
      {open ? <nav className="space-y-0.5">{children}</nav> : null}
      <hr className="my-3 border-[#5A6169]/70" />
    </section>
  );
}
