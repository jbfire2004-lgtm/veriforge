"use client";

import { useId, useState, type InputHTMLAttributes } from "react";
import { sfCn } from "../theme/cn";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "placeholder"> & {
  label: string;
  hint?: string;
  icon?: React.ReactNode;
};

export function SfFloatingInput({
  label,
  hint,
  icon,
  className,
  value,
  onFocus,
  onBlur,
  ...props
}: Props) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const hasValue = value != null && String(value).length > 0;
  const floated = focused || hasValue;

  return (
    <div className="relative">
      <div
        className={sfCn(
          "group relative flex items-center rounded-[3px] border bg-[var(--sf-surface)] shadow-none transition-[border-color,box-shadow] duration-150",
          focused
            ? "border-[var(--sf-accent,#1e6fb8)] shadow-[var(--sf-shadow-glow)]"
            : "border-[var(--sf-slate-600,#5a6169)] hover:border-[var(--sf-slate-500)]",
        )}
      >
        {icon ? (
          <span className="pointer-events-none pl-3 text-[var(--sf-text-muted)] transition-colors group-focus-within:text-[var(--sf-accent,#1e6fb8)]">
            {icon}
          </span>
        ) : null}
        <input
          id={id}
          value={value}
          className={sfCn(
            "peer w-full bg-transparent px-3 pb-2.5 pt-5 text-sm text-[var(--sf-text)] outline-none",
            icon && "pl-1",
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
            "pointer-events-none absolute left-3 origin-left text-[var(--sf-text-muted)] transition-all duration-200",
            icon && "left-10",
            floated
              ? "top-1.5 scale-[0.85] text-[var(--sf-accent,#1e6fb8)]"
              : "top-3.5 text-sm",
          )}
        >
          {label}
          {props.required ? <span className="text-[var(--sf-warning)]"> *</span> : null}
        </label>
      </div>
      {hint ? <p className="mt-1.5 text-xs text-[var(--sf-text-subtle)]">{hint}</p> : null}
    </div>
  );
}
