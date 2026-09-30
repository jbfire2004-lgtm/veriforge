"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { sfCn } from "@/src/components/safety-forms/theme/cn";
import { SmsButton } from "./SmsButton";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * SMS tool drawer — bottom sheet on mobile, right-side panel on desktop.
 */
export function SmsDrawer({ open, onOpenChange, title, children, className }: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  const titleId = "sms-drawer-title";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-stretch md:justify-end">
      <button
        type="button"
        aria-label="Close drawer"
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={sfCn(
          "sms-drawer-sheet relative z-10 flex max-h-[88vh] w-full flex-col rounded-t-[var(--sf-radius-xl)] border border-[var(--sf-border)] bg-[var(--sf-surface)] shadow-[var(--sf-shadow-lg)]",
          "md:max-h-none md:h-full md:max-w-md md:rounded-none md:rounded-l-[var(--sf-radius-xl)] md:pb-0",
          className,
        )}
      >
        <div
          className="mx-auto mt-2 mb-1 h-1 w-10 shrink-0 rounded-full bg-[var(--sf-border-strong)] md:hidden"
          aria-hidden
        />
        <header className="flex items-center justify-between gap-3 border-b border-[var(--sf-border)] px-[var(--sms-space-4)] py-[var(--sms-space-3)]">
          {title ? (
            <h2 id={titleId} className="sms-text-h3">
              {title}
            </h2>
          ) : (
            <span />
          )}
          <SmsButton
            type="button"
            variant="ghost"
            size="sm"
            className="sms-tap-target"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" aria-hidden />
          </SmsButton>
        </header>
        <div className="flex-1 overflow-y-auto overscroll-contain p-[var(--sms-space-4)]">
          {children}
        </div>
      </div>
    </div>
  );
}
