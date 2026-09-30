"use client";

import { useId, useState, type TextareaHTMLAttributes } from "react";
import { sfCn } from "../theme/cn";

type Props = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "placeholder"> & {
  label: string;
};

export function SfFloatingTextarea({
  label,
  className,
  value,
  onFocus,
  onBlur,
  ...props
}: Props) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const floated = focused || (value != null && String(value).length > 0);

  return (
    <div className="relative">
      <textarea
        id={id}
        value={value}
        className={sfCn(
          "w-full rounded-[var(--sf-radius-md)] border bg-[var(--sf-surface)] px-3 pb-3 pt-7 text-sm text-[var(--sf-text)] outline-none transition-all duration-200",
          focused
            ? "border-[var(--sf-primary)] shadow-[var(--sf-shadow-glow)]"
            : "border-[var(--sf-border-strong)] hover:border-[var(--sf-slate-400)]",
          className,
        )}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />
      <label
        htmlFor={id}
        className={sfCn(
          "pointer-events-none absolute left-3 text-[var(--sf-text-muted)] transition-all duration-200",
          floated ? "top-2 scale-[0.85] text-[var(--sf-primary)]" : "top-3.5 text-sm",
        )}
      >
        {label}
      </label>
    </div>
  );
}
