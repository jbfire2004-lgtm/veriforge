"use client";

import { useEffect, useState } from "react";
import { resolvePhotoDisplayUrl, type CoreFileDto } from "@/lib/vsi-upload";
import { fetchCoreUploadById } from "@/lib/core-upload";

type EvidenceItem = {
  dataUrl?: string;
  publicUrl?: string;
  storageKey?: string;
  caption?: string;
  coreFileId?: number;
};

function resolveSrc(ev: EvidenceItem, coreFile?: CoreFileDto | null): string | null {
  if (ev.dataUrl) return ev.dataUrl;
  if (ev.publicUrl) return ev.publicUrl;
  if (coreFile) return resolvePhotoDisplayUrl(coreFile);
  return null;
}

export function VsiEvidenceGallery({
  title,
  items,
}: {
  title: string;
  items: EvidenceItem[];
}) {
  const [resolved, setResolved] = useState<
    Array<{ ev: EvidenceItem; src: string | null }>
  >([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const out: Array<{ ev: EvidenceItem; src: string | null }> = [];
      for (const ev of items ?? []) {
        let coreFile: CoreFileDto | null = null;
        if (ev.coreFileId && !ev.dataUrl && !ev.publicUrl) {
          try {
            coreFile = await fetchCoreUploadById(ev.coreFileId);
          } catch {
            coreFile = null;
          }
        }
        out.push({ ev, src: resolveSrc(ev, coreFile) });
      }
      if (!cancelled) setResolved(out);
    })();
    return () => {
      cancelled = true;
    };
  }, [items]);

  const visible = resolved.filter((r) => r.src);
  if (!visible.length) return null;

  return (
    <section className="space-y-2 rounded-xl border border-[var(--sf-border)] bg-[var(--sf-surface)] p-4">
      <h3 className="text-sm font-medium text-[var(--sf-text)]">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {visible.map(({ ev, src }, i) => (
          <figure
            key={`${ev.coreFileId ?? src?.slice(0, 32)}-${i}`}
            className="overflow-hidden rounded-lg border border-[var(--sf-border)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src!}
              alt={ev.caption ?? title}
              className="aspect-video w-full object-cover"
            />
            {ev.caption && (
              <figcaption className="p-2 text-xs text-[var(--sf-text-muted)]">
                {ev.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}
