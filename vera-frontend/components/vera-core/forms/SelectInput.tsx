"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/src/lib/utils";
import type { VeraFieldProps } from "../shared/types";

export type SelectOption = { value: string; label: string; disabled?: boolean };

export type SelectInputProps = VeraFieldProps & {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
};

export function SelectInput({
  label,
  description,
  error,
  required,
  id: idProp,
  options,
  value,
  onChange,
  placeholder = "Select…",
  className,
  disabled,
}: SelectInputProps) {
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
      <Select
        id={id}
        value={value}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        onChange={(e) => onChange?.(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </Select>
      {error ? (
        <p role="alert" className="text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}
    </section>
  );
}
