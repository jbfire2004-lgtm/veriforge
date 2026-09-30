"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/src/lib/utils";
import {
  fetchAssetDocuments,
  type AssetTimelineResponse,
} from "@/lib/documents";

/** Asset Documents timeline — inspections, PM, failures, vendor reports. */
export function AssetDocumentsPanel({
  assetId,
  className,
}: {
  assetId: string | number;
  className?: string;
}) {
  const id = String(assetId);
  const [data, setData] = React.useState<AssetTimelineResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    void fetchAssetDocuments(id)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load timeline");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <section
      className={cn(
        "rounded-[6px] border border-[#2A2E33]/14 bg-white p-4 shadow-none",
        className,
      )}
    >
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#2F8F8C]">
            Document history
          </p>
          <h3 className="mt-1 text-sm font-semibold text-[#2A2E33]">
            Inspections, PM tasks, failures, vendor reports
          </h3>
        </div>
        <Link
          href={`/documents/completed?asset_id=${encodeURIComponent(id)}`}
          className="text-sm font-medium text-[#1E6FB8] hover:underline"
        >
          Open in hub →
        </Link>
      </header>

      {error ? (
        <p className="text-sm text-[#C89F3D]">{error}</p>
      ) : !data ? (
        <p className="text-sm text-[#5A6169]">Loading timeline…</p>
      ) : data.total === 0 ? (
        <p className="text-sm text-[#5A6169]">No documents for this asset.</p>
      ) : (
        <ol className="relative space-y-0 border-l border-[#5A6169] ml-2">
          {data.timeline.map((ev) => {
            const critical =
              ev.document_type === "FailureReport" || ev.status === "RequiresReview";
            return (
              <li key={ev.document_id} className="relative pb-4 pl-5">
                <span
                  className={cn(
                    "absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white",
                    critical ? "bg-[#B33A3A]" : "bg-[#1E6FB8]",
                  )}
                />
                <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[#5A6169]">
                  {new Date(ev.event_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  })}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-[#2A2E33]">
                  {ev.headline}
                </p>
                <p className="text-xs text-[#5A6169]">
                  {ev.worker_name ?? "—"} · {ev.status}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
