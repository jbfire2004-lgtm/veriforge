"use client";

import type { ReactNode } from "react";
import { SmsAlert, SmsButton } from "@/src/components/sms/design-system";
import { sfCn } from "@/src/components/safety-forms/theme/cn";

export type SmsWorkflowFooterProps = {
  onBack?: () => void;
  onNext?: () => void;
  onSaveDraft?: () => void;
  onSubmit?: () => void;
  showBack?: boolean;
  showNext?: boolean;
  showSaveDraft?: boolean;
  showSubmit?: boolean;
  saveDraftLabel?: string;
  submitLabel?: string;
  nextLabel?: string;
  backLabel?: string;
  saving?: boolean;
  submitting?: boolean;
  error?: string | null;
  stepError?: string | null;
  extra?: ReactNode;
};

export function SmsWorkflowFooter({
  onBack,
  onNext,
  onSaveDraft,
  onSubmit,
  showBack = true,
  showNext = true,
  showSaveDraft = true,
  showSubmit = false,
  saveDraftLabel = "Save draft",
  submitLabel = "Submit",
  nextLabel = "Next",
  backLabel = "Back",
  saving = false,
  submitting = false,
  error,
  stepError,
  extra,
}: SmsWorkflowFooterProps) {
  const busy = saving || submitting;
  const primaryAction = showSubmit && onSubmit ? onSubmit : showNext && onNext ? onNext : null;
  const primaryLabel =
    showSubmit && onSubmit
      ? submitting
        ? "Submitting…"
        : submitLabel
      : nextLabel;

  return (
    <div
      className="sticky bottom-0 z-30 -mx-[var(--sms-space-4)] border-t border-[var(--sf-border)] bg-[var(--sf-surface)]/95 px-[var(--sms-space-4)] py-[var(--sms-space-4)] backdrop-blur-sm sm:-mx-[var(--sms-space-6)] sm:px-[var(--sms-space-6)]"
      style={{ paddingBottom: "max(var(--sms-space-4), env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto max-w-[var(--sms-page-max)] space-y-3">
        {stepError || error ? (
          <SmsAlert tone="error" role="alert">
            {stepError ?? error}
          </SmsAlert>
        ) : null}

        {extra}

        {/* Mobile: primary action full width on top */}
        <div className="flex flex-col gap-2 md:hidden">
          {primaryAction ? (
            <SmsButton
              type="button"
              className="sms-tap-target w-full"
              disabled={busy}
              onClick={primaryAction}
            >
              {busy && (submitting || saving) ? "Please wait…" : primaryLabel}
            </SmsButton>
          ) : null}
          <div className="flex gap-2">
            {showBack && onBack ? (
              <SmsButton
                type="button"
                variant="secondary"
                className="sms-tap-target flex-1"
                disabled={busy}
                onClick={onBack}
              >
                {backLabel}
              </SmsButton>
            ) : null}
            {showSaveDraft && onSaveDraft ? (
              <SmsButton
                type="button"
                variant="secondary"
                className="sms-tap-target flex-1"
                disabled={busy}
                onClick={onSaveDraft}
              >
                {saving && !submitting ? "Saving…" : saveDraftLabel}
              </SmsButton>
            ) : null}
          </div>
        </div>

        {/* Desktop: nav left, actions right */}
        <div className="hidden md:flex md:flex-wrap md:items-center md:justify-between md:gap-2">
          <div className="flex gap-2">
            {showBack && onBack ? (
              <SmsButton type="button" variant="secondary" disabled={busy} onClick={onBack}>
                {backLabel}
              </SmsButton>
            ) : null}
            {showNext && onNext ? (
              <SmsButton type="button" disabled={busy} onClick={onNext}>
                {nextLabel}
              </SmsButton>
            ) : null}
          </div>
          <div className="flex gap-2">
            {showSaveDraft && onSaveDraft ? (
              <SmsButton
                type="button"
                variant="secondary"
                disabled={busy}
                onClick={onSaveDraft}
              >
                {saving && !submitting ? "Saving…" : saveDraftLabel}
              </SmsButton>
            ) : null}
            {showSubmit && onSubmit ? (
              <SmsButton type="button" disabled={busy} onClick={onSubmit}>
                {submitting ? "Submitting…" : submitLabel}
              </SmsButton>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
