import type { ReactNode } from "react";
import { sfCn } from "@/src/components/safety-forms/theme/cn";

type Props = {
  label?: ReactNode;
  htmlFor?: string;
  helperText?: ReactNode;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

/** Field group with label, helper text, and validation error — standard SMS form pattern. */
export function SmsFormField({
  label,
  htmlFor,
  helperText,
  error,
  required,
  children,
  className,
}: Props) {
  const hasError = Boolean(error);

  return (
    <div className={sfCn("space-y-1", className)}>
      {label ? (
        <label htmlFor={htmlFor} className="sms-text-label block">
          {label}
          {required ? (
            <span className="ml-0.5 text-[var(--sf-danger)]" aria-hidden>
              *
            </span>
          ) : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs text-[var(--sf-danger)]" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-[var(--sf-text-subtle)]">{helperText}</p>
      ) : null}
    </div>
  );
}
