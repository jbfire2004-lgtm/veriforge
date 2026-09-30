"use client";

import { ImagePlus, X, ZoomIn } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { sfCn } from "../theme/cn";

export type PhotoItem = { name: string; dataUrl: string };

type Props = {
  label: string;
  value?: PhotoItem[];
  onChange: (photos: PhotoItem[]) => void;
  disabled?: boolean;
};

export function PhotoUploader({ label, value = [], onChange, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [preview, setPreview] = useState<PhotoItem | null>(null);

  const addFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      const next = [...value];
      let loaded = 0;
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          next.push({ name: file.name, dataUrl: String(reader.result) });
          loaded += 1;
          if (loaded === files.length) onChange([...next]);
        };
        reader.readAsDataURL(file);
      });
    },
    [value, onChange],
  );

  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="text-sm font-medium text-[var(--sf-text)]">{label}</legend>
      <section
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          addFiles(e.dataTransfer.files);
        }}
        className={sfCn(
          "relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-[var(--sf-radius-lg)] border-2 border-dashed p-6 transition-all duration-300",
          drag
            ? "border-[var(--sf-primary)] bg-[var(--sf-primary-muted)] shadow-[var(--sf-shadow-glow)]"
            : "border-[var(--sf-border-strong)] bg-[var(--sf-surface)] hover:border-[var(--sf-primary)] hover:bg-[var(--sf-surface-hover)]",
        )}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          capture="environment"
          className="hidden"
          multiple
          disabled={disabled}
          onChange={(e) => addFiles(e.target.files)}
        />
        <ImagePlus
          className={sfCn(
            "h-10 w-10 text-[var(--sf-text-muted)] transition-transform duration-300",
            drag && "scale-110 text-[var(--sf-primary)]",
          )}
        />
        <p className="mt-2 text-sm font-medium text-[var(--sf-text)]">
          Drop photos here or tap to capture
        </p>
        <p className="text-xs text-[var(--sf-text-muted)]">Images and video supported</p>
      </section>
      {value.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {value.map((p, i) => (
            <li
              key={`${p.name}-${i}`}
              className="group relative overflow-hidden rounded-[var(--sf-radius-md)] border border-[var(--sf-border)] shadow-[var(--sf-shadow-sm)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.dataUrl} alt={p.name} className="h-24 w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  className="rounded-full bg-white/90 p-1.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreview(p);
                  }}
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="rounded-full bg-white/90 p-1.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(value.filter((_, idx) => idx !== i));
                  }}
                >
                  <X className="h-4 w-4 text-red-600" />
                </button>
              </div>
              <span className="block truncate px-2 py-1 text-xs">{p.name}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {preview ? (
        <dialog
          open
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setPreview(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.dataUrl}
            alt={preview.name}
            className="max-h-[90vh] max-w-full rounded-[var(--sf-radius-lg)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </dialog>
      ) : null}
    </fieldset>
  );
}
