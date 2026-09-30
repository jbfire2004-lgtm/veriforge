"use client";

import { useEffect, useState } from "react";
import { fetchSafetySuiteLibraries } from "@/lib/safety-suite";
import { VeraPageLayout } from "@/src/components/navigation";
import { SfCard } from "@/src/components/safety-forms/ui";

export default function SafetySuiteLibrariesPage({
  projectId = 1,
  companyId = 1,
}: {
  projectId?: number;
  companyId?: number;
}) {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchSafetySuiteLibraries>> | null>(
    null,
  );

  useEffect(() => {
    void fetchSafetySuiteLibraries(companyId, projectId).then(setData).catch(() => undefined);
  }, [companyId, projectId]);

  return (
    <VeraPageLayout
      title="Hazard & control libraries"
      description="Seeded libraries for JHA/FLHA, SIF indicators, and HECA categories (Energy Wheel)."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <LibraryPanel title="Hazards" rows={data?.hazards ?? []} labelKey="description" metaKey="category" />
        <LibraryPanel title="Controls" rows={data?.controls ?? []} labelKey="description" metaKey="controlType" />
        <LibraryPanel
          title="SIF indicators"
          rows={data?.sifIndicators ?? []}
          labelKey="label"
          metaKey="code"
        />
        <LibraryPanel
          title="HECA categories"
          rows={data?.hecaCategories ?? []}
          labelKey="label"
          metaKey="code"
        />
      </div>

      {data?.energyWheel?.length ? (
        <SfCard className="p-5">
          <h2 className="mb-3 font-medium">Energy wheel segments</h2>
          <div className="flex flex-wrap gap-2">
            {data.energyWheel.map((seg) => (
              <span
                key={String(seg.type)}
                className="rounded-full border px-3 py-1 text-xs text-[var(--sf-text-muted)]"
              >
                {String(seg.label)}
              </span>
            ))}
          </div>
        </SfCard>
      ) : null}
    </VeraPageLayout>
  );
}

function LibraryPanel({
  title,
  rows,
  labelKey,
  metaKey,
}: {
  title: string;
  rows: Array<Record<string, unknown>>;
  labelKey: string;
  metaKey: string;
}) {
  return (
    <SfCard className="p-5">
      <h2 className="mb-3 font-medium">
        {title} ({rows.length})
      </h2>
      <ul className="max-h-80 divide-y overflow-y-auto text-sm">
        {rows.length === 0 ? (
          <li className="py-2 text-[var(--sf-text-muted)]">No entries.</li>
        ) : (
          rows.map((r) => (
            <li key={String(r.id)} className="flex justify-between gap-2 py-2">
              <span>{String(r[labelKey] ?? "")}</span>
              <span className="shrink-0 text-[var(--sf-text-muted)]">{String(r[metaKey] ?? "")}</span>
            </li>
          ))
        )}
      </ul>
    </SfCard>
  );
}
