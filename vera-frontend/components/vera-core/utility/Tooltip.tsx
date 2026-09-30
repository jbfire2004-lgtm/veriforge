"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";

export type TooltipProps = {
  content: string;
  children: React.ReactElement;
  side?: "top" | "bottom";
};

export function Tooltip({ content, children, side = "top" }: TooltipProps) {
  const [open, setOpen] = React.useState(false);
  const id = React.useId();

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {React.cloneElement(children, {
        "aria-describedby": open ? id : undefined,
      } as React.HTMLAttributes<HTMLElement>)}
      {open ? (
        <span
          id={id}
          role="tooltip"
          className={cn(
            "pointer-events-none absolute z-50 max-w-xs rounded-[var(--radius-md)] bg-[var(--color-gray-900)] px-2 py-1 text-xs text-white shadow-[var(--shadow-md)]",
            side === "top" && "bottom-full left-1/2 mb-2 -translate-x-1/2",
            side === "bottom" && "top-full left-1/2 mt-2 -translate-x-1/2"
          )}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
