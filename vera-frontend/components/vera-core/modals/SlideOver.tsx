"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/components/ui/button";

export type SlideOverProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  side?: "right" | "left";
  className?: string;
  dismissOnBackdrop?: boolean;
};

export function SlideOver({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  side = "right",
  className,
  dismissOnBackdrop = true,
}: SlideOverProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
  <>
    <button
      type="button"
      aria-label="Close panel"
      className="fixed inset-0 z-40 bg-black/40"
      onClick={() => dismissOnBackdrop && onOpenChange(false)}
    />
    <aside
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "slide-over-title" : undefined}
      className={cn(
        "fixed top-0 z-50 flex h-full w-full max-w-md flex-col border-[var(--border)] bg-[var(--surface)] shadow-xl",
        side === "right" ? "right-0 border-l" : "left-0 border-r",
        className
      )}
    >
      <header className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-6 py-4">
        <div className="min-w-0 space-y-1">
          {title ? (
            <h2 id="slide-over-title" className="text-lg font-semibold text-[var(--foreground)]">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="text-sm text-[var(--muted-foreground)]">{description}</p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="Close"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </header>
      <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
      {footer ? (
        <footer className="border-t border-[var(--border)] px-6 py-4">{footer}</footer>
      ) : null}
    </aside>
  </>
  );
}
