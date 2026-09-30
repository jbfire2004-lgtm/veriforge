"use client";

import { type InputHTMLAttributes } from "react";
import { sfCn } from "../theme/cn";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

/** Industrial text input — graphite border, safety-blue focus glow. */
export function SfInput({ label, className, id, ...props }: Props) {
  const inputId = id ?? (label ? label.replace(/\s+/g, "-").toLowerCase() : undefined);
  return (
    <label className="block min-w-[8rem] flex-1">
      {label ? (
        <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--sf-text-muted)]">
          {label}
        </span>
      ) : null}
      <input
        id={inputId}
        className={sfCn(
          "h-10 w-full rounded-[3px] border border-[var(--sf-slate-600,#5a6169)] bg-[var(--sf-surface)] px-3 text-sm text-[var(--sf-text)] shadow-none outline-none",
          "transition-[border-color,box-shadow] duration-150",
          "placeholder:text-[var(--sf-text-subtle)]",
          "focus:border-[var(--sf-accent,#1e6fb8)] focus:shadow-[var(--sf-shadow-glow)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </label>
  );
}
