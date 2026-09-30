"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/src/lib/utils";
import type { VeraFieldProps } from "../shared/types";

export type TextInputProps = VeraFieldProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "id"> & {
    success?: string;
  };

export function TextInput({
  label,
  description,
  error,
  success,
  required,
  id: idProp,
  className,
  ...props
}: TextInputProps) {
  const generatedId = React.useId();
  const id = idProp ?? generatedId;
  const invalid = Boolean(error);

  return (
    <section className={cn("space-y-1.5", className)}>
      {label ? (
        <Label htmlFor={id}>
          {label}
          {required ? <span className="text-[var(--danger)]"> *</span> : null}
        </Label>
      ) : null}
      {description ? (
        <p className="text-xs text-[var(--muted-foreground)]">{description}</p>
      ) : null}
      <Input id={id} aria-invalid={invalid} aria-describedby={error ? `${id}-error` : undefined} {...props} />
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}
      {success && !error ? (
        <p className="text-sm text-[var(--color-success)]">{success}</p>
      ) : null}
    </section>
  );
}
