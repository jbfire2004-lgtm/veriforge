"use client";

import { Button } from "@/components/ui";
import type { DocumentVersion } from "@/lib/document-center-api";

export function VersionViewer({
  open,
  title,
  versions,
  onClose,
}: {
  open: boolean;
  title: string;
  versions: DocumentVersion[];
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg space-y-4 border border-zinc-200 bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Version history</h2>
            <p className="text-sm text-zinc-600">{title}</p>
          </div>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
        <ul className="max-h-80 divide-y divide-zinc-200 overflow-auto border border-zinc-200 text-sm">
          {versions.map((v) => (
            <li key={v.id} className="space-y-1 px-3 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong>v{v.version}</strong>
                <time className="text-xs text-zinc-500">
                  {new Date(v.createdAt).toLocaleString()}
                </time>
              </div>
              <p className="text-zinc-600">
                {v.fileName || "file"}
                {v.sizeBytes != null
                  ? ` · ${(v.sizeBytes / 1024).toFixed(1)} KB`
                  : ""}
              </p>
              {v.changeNote ? (
                <p className="text-zinc-500">{v.changeNote}</p>
              ) : null}
              <a
                href={v.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sky-700 underline"
              >
                Open file
              </a>
            </li>
          ))}
          {!versions.length ? (
            <li className="px-3 py-4 text-zinc-500">No versions yet.</li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
