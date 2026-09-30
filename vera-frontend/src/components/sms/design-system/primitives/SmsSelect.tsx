"use client";

import { type SelectHTMLAttributes } from "react";
import { sfCn } from "@/src/components/safety-forms/theme/cn";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  helperText?: string;
  error?: string;
};

/** Native select styled with SMS tokens — works offline and on mobile. */
export function SmsSelect({
  label,
  helperText,
  error,
  className,
  id,
  children,
  ...props
}: Props) {
  const selectId =
    id ?? (label ? label.replace(/\s+/g, "-").toLowerCase() : undefined);
  const hasError = Boolean(error);

  return (
    <div className="min-w-[8rem] flex-1">
      {label ? (
        <label htmlFor={selectId} className="sms-text-label mb-1 block">
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        aria-invalid={hasError || undefined}
        className={sfCn(
          "w-full rounded-[var(--sf-radius-md)] border bg-[var(--sf-surface)] px-3 py-2 text-sm outline-none transition-colors",
          hasError
            ? "border-[var(--sf-danger)] focus:shadow-[0_0_0_3px_rgba(220,38,38,0.25)]"
            : "border-[var(--sf-border-strong)] focus:border-[var(--sf-primary)] focus:shadow-[var(--sf-shadow-glow)]",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <p className="mt-1 text-xs text-[var(--sf-danger)]" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-[var(--sf-text-subtle)]">{helperText}</p>
      ) : null}
    </div>
  );
}
