"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/src/lib/utils";
import type { VeraFieldProps } from "../shared/types";

export type DateInputProps = VeraFieldProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "id">;

export function DateInput({
  label,
  description,
  error,
  required,
  id: idProp,
  className,
  min,
  max,
  value,
  onChange,
  ...props
}: DateInputProps) {
  const generatedId = React.useId();
  const id = idProp ?? generatedId;

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
      <Input
        id={id}
        type="date"
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error ? (
        <p role="alert" className="text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}
    </section>
  );
}
