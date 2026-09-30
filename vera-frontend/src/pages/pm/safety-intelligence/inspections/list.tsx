"use client";

import { ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  fetchSafetyInspections,
  type SafetyInspectionSummary,
} from "@/lib/safety-intelligence";
import { SfButton, SfCard, SfFloatingInput } from "@/src/components/safety-forms/ui";

export default function WalkAroundListPage() {
  const [rows, setRows] = useState<SafetyInspectionSummary[]>([]);
  const [projectId, setProjectId] = useState("1");
  const [loading, setLoading] = useState(true);

  const parsed = useMemo(() => {
    const n = Number(projectId);
    return Number.isSafeInteger(n) && n > 0 ? n : undefined;
  }, [projectId]);

  useEffect(() => {
    if (!parsed) return;
    setLoading(true);
    fetchSafetyInspections(parsed)
      .then(setRows)
      .finally(() => setLoading(false));
  }, [parsed]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Walk-around inspections</h1>
        </div>
        <Link href="/pm/safety-intelligence/inspections/new">
          <SfButton type="button">
            <Plus className="h-4 w-4" />
            Start inspection
          </SfButton>
        </Link>
      </header>

      <SfCard className="p-6">
        <SfFloatingInput
          label="Project ID"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="max-w-[140px]"
        />
      </SfCard>

      {loading ? (
        <p className="text-sm text-[var(--sf-text-muted)]">Loading…</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id}>
              <Link href={`/pm/safety-intelligence/inspections/${r.id}`}>
                <SfCard className="flex items-center justify-between p-5">
                  <div>
                    <p className="font-medium">{r.title ?? "Walk-around"}</p>
                    <p className="text-xs text-[var(--sf-text-muted)]">
                      {r.project?.name} · {r.status} · {r._count?.items ?? 0} items
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[var(--sf-text-muted)]" />
                </SfCard>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
