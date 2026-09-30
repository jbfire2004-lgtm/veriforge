"use client";

import { useState } from "react";
import { buttonStyles } from "@/components/ui/button";

export function QuickCreateMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        className={buttonStyles({ variant: "teal", size: "sm" })}
        onClick={() => setOpen((v) => !v)}
      >
        Create
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border bg-popover p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          <button type="button" className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-muted">
            Post update
          </button>
          <button type="button" className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-muted">
            Share training
          </button>
          <button type="button" className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-muted">
            Post a job
          </button>
        </div>
      ) : null}
    </div>
  );
}
