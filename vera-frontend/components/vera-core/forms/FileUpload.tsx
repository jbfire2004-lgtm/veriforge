"use client";

import * as React from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { VeraFieldProps } from "../shared/types";

export type FileUploadProps = VeraFieldProps & {
  accept?: string;
  multiple?: boolean;
  value?: File[];
  onChange?: (files: File[]) => void;
  maxSizeMb?: number;
  className?: string;
};

export function FileUpload({
  label,
  description,
  error,
  accept = "image/*,application/pdf",
  multiple,
  value = [],
  onChange,
  maxSizeMb = 10,
  className,
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);

  function handleFiles(list: FileList | null) {
    if (!list) return;
    const files = Array.from(list).filter((f) => f.size <= maxSizeMb * 1024 * 1024);
    onChange?.(multiple ? [...value, ...files] : files.slice(0, 1));
  }

  return (
    <section className={cn("space-y-2", className)}>
      {label ? <Label>{label}</Label> : null}
      {description ? (
        <p className="text-xs text-[var(--muted-foreground)]">{description}</p>
      ) : null}
      <section
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-[var(--radius-md)] border-2 border-dashed p-8 text-center",
          dragOver
            ? "border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]"
            : "border-[var(--border)] bg-[var(--muted)]"
        )}
      >
        <Upload className="mb-2 h-8 w-8 text-[var(--muted-foreground)]" aria-hidden />
        <p className="text-sm font-medium">Drag files here or click to browse</p>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Max {maxSizeMb}MB per file
        </p>
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </section>
      {value.length > 0 ? (
        <ul className="space-y-2">
          {value.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] px-3 py-2 text-sm"
            >
              <span className="truncate">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`Remove ${file.name}`}
                onClick={() => onChange?.(value.filter((_, j) => j !== i))}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}
    </section>
  );
}
