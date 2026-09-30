"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/components/ui/button";

type FileUploadProps = {
  label?: string;
  accept?: string;
  disabled?: boolean;
  /** Called with a local object URL (placeholder until storage upload lands). */
  onFileReady?: (payload: { name: string; url: string; file: File }) => void;
  className?: string;
};

export function FileUpload({
  label = "Upload file",
  accept = "*/*",
  disabled,
  onFileReady,
  className,
}: FileUploadProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="block text-sm font-medium text-zinc-700">
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          disabled={disabled}
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const url = URL.createObjectURL(file);
            setFileName(file.name);
            onFileReady?.({ name: file.name, url, file });
          }}
        />
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          Choose file
        </Button>
        <span className="text-sm text-zinc-500">
          {fileName ?? "No file selected"}
        </span>
      </div>
    </div>
  );
}
