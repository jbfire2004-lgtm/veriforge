"use client";

import * as React from "react";
import { Topbar } from "@/components/ui/topbar";
import { cn } from "@/src/lib/utils";

export type VeraTopBarProps = {
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  className?: string;
};

/** Industrial slate top bar for Vera Core surfaces. */
export function VeraTopBar({
  leading,
  trailing,
  breadcrumbs,
  className,
}: VeraTopBarProps) {
  return (
    <Topbar
      className={cn(className)}
      leading={leading}
      trailing={
        <section className="flex items-center gap-2">
          {breadcrumbs}
          {trailing}
        </section>
      }
    />
  );
}
