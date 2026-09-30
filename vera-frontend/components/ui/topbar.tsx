import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface TopbarProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title?: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

/** Industrial slate top bar primitive. */
export function Topbar({
  className,
  title,
  leading,
  trailing,
  ...props
}: TopbarProps) {
  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center justify-between gap-4 border-b border-[#1F2328] bg-[#2A2E33] px-4 text-[#F4F6F8] shadow-none sm:h-16 sm:gap-6 sm:px-6",
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        {leading}
        {title != null && (
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold uppercase tracking-[0.08em] text-[#F4F6F8] sm:text-base">
              {title}
            </h1>
          </div>
        )}
      </div>
      {trailing != null && (
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">{trailing}</div>
      )}
    </header>
  );
}
