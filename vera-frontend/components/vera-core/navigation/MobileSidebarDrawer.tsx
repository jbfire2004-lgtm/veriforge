"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/components/ui/button";

export type MobileSidebarDrawerProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: "left" | "right";
  className?: string;
};

/**
 * Mobile slide-in navigation drawer (§3).
 */
export function MobileSidebarDrawer({
  open,
  onClose,
  title = "Navigation",
  children,
  side = "left",
  className,
}: MobileSidebarDrawerProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation"
        className="fixed inset-0 z-40 bg-black/50 vera-motion-fade-in lg:hidden"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "fixed top-0 z-50 flex h-full w-[min(100%,20rem)] flex-col border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)] vera-motion-slide-in-left lg:hidden",
          side === "left" ? "left-0 border-r" : "right-0 border-l",
          className
        )}
      >
        <header className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <span className="font-semibold text-[var(--foreground)]">{title}</span>
          <Button type="button" variant="ghost" size="sm" aria-label="Close" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </header>
        <div className="flex-1 overflow-y-auto p-3">{children}</div>
      </aside>
    </>
  );
}
