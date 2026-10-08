"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  fetchBboObservations,
  fetchBboMetrics,
  type BboSummary,
} from "@/lib/safety-intelligence";
import { VeraPageLayout } from "@/src/components/navigation";
import {
  SfButton,
  SfCard,
  SfFloatingInput,
  SfKpiCard,
} from "@/src/components/safety-forms/ui";

const CATEGORY_LABELS: Record<string, string> = {
  body_position: "Body position",
  ppe: "PPE",
  tools_equipment: "Tools & equipment",
  procedures: "Procedures",
  housekeeping: "Housekeeping",
  line_of_fire: "Line of fire",
  other: "Other",
};

export default function BboListPage() {
  const [rows, setRows] = useState<BboSummary[]>([]);
  const [metrics, setMetrics] = useState<{
    positiveRatio: number;
    safe: number;
    atRisk: number;
    atRiskByCategory?: { category: string | null; count: number }[];
  } | null>(null);
  const [projectId, setProjectId] = useState("1");
  const [polarityFilter, setPolarityFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const parsed = useMemo(() => {
    const n = Number(projectId);
    return Number.isSafeInteger(n) && n > 0 ? n : undefined;
  }, [projectId]);

  useEffect(() => {
    if (!parsed) return;
    setLoading(true);
    Promise.all([
      fetchBboObservations(parsed, {
        polarity: polarityFilter || undefined,
        behaviorCategory: categoryFilter || undefined,
      }),
      fetchBboMetrics(parsed),
    ])
      .then(([list, m]) => {
        setRows(list);
        setMetrics(m);
      })
      .finally(() => setLoading(false));
  }, [parsed, polarityFilter, categoryFilter]);

  return (
    <VeraPageLayout
      title="Behaviour-based observations"
      description="Leading indicators from field coaching — safe reinforcement and at-risk follow-up."
      actions={
        <Link href="/pm/safety-intelligence/bbo/new">
          <SfButton type="button">New BBO</SfButton>
        </Link>
      }
    >
      <div className="space-y-6">
        <SfCard className="flex flex-wrap items-end gap-4 p-6">
          <SfFloatingInput
            label="Project ID"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="max-w-[140px]"
          />
          <label className="text-sm">
            Polarity
            <select
              className="mt-1 block rounded-[3px] border border-[var(--sf-border)] bg-transparent px-3 py-2"
              value={polarityFilter}
              onChange={(e) => setPolarityFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="safe">Safe</option>
              <option value="at_risk">At risk</option>
            </select>
          </label>
          <label className="text-sm">
            Category
            <select
              className="mt-1 block rounded-[3px] border border-[var(--sf-border)] bg-transparent px-3 py-2"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All</option>
              {Object.entries(CATEGORY_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </SfCard>

        {metrics && (
          <div className="grid gap-4 sm:grid-cols-3">
            <SfKpiCard
              label="Positive ratio"
              value={`${Math.round(metrics.positiveRatio * 100)}%`}
              tone="success"
            />
            <SfKpiCard label="Safe" value={metrics.safe} />
            <SfKpiCard label="At risk" value={metrics.atRisk} tone="warning" />
          </div>
        )}

        {metrics?.atRiskByCategory && metrics.atRiskByCategory.length > 0 && (
          <SfCard className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--sf-text-muted)]">
              Top at-risk categories
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {metrics.atRiskByCategory.map((c) => (
                <li
                  key={String(c.category)}
                  className="rounded-[3px] border border-[var(--sf-border)] px-2 py-1 text-xs"
                >
                  {c.category
                    ? CATEGORY_LABELS[c.category] ?? c.category
                    : "Uncategorized"}{" "}
                  · {c.count}
                </li>
              ))}
            </ul>
          </SfCard>
        )}

        {loading ? (
          <p className="text-sm text-[var(--sf-text-muted)]">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-[var(--sf-text-muted)]">
            No observations for this filter.
          </p>
        ) : (
          <ul className="space-y-3">
            {rows.map((r) => (
              <li key={r.id}>
                <SfCard className="p-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-[var(--sf-text-muted)]">
                    <span
                      className={
                        r.polarity === "at_risk"
                          ? "text-[#C89F3D]"
                          : "text-[#4FAF6F]"
                      }
                    >
                      {r.polarity === "at_risk" ? "At risk" : "Safe"}
                    </span>
                    {r.behaviorCategory && (
                      <span className="rounded-[3px] border border-[var(--sf-border)] px-1.5 py-0.5">
                        {CATEGORY_LABELS[r.behaviorCategory] ??
                          r.behaviorCategory}
                      </span>
                    )}
                    {r.feedbackGiven && (
                      <span className="rounded-[3px] border border-[var(--sf-border)] px-1.5 py-0.5">
                        Feedback given
                      </span>
                    )}
                    {r.steeringEscalate && (
                      <span className="rounded-[3px] border border-[#B33A3A]/50 px-1.5 py-0.5 text-[#B33A3A]">
                        Escalate
                      </span>
                    )}
                  </div>
                  <p className="mt-2 font-medium">{r.behaviorDescription}</p>
                  {r.workActivity && (
                    <p className="mt-1 text-sm text-[var(--sf-text-muted)]">
                      Activity: {r.workActivity}
                    </p>
                  )}
                  {r.cailEntry && (
                    <Link
                      href={`/pm/safety-intelligence/${r.cailEntry.id}`}
                      className="mt-2 inline-block text-sm text-[var(--sf-primary)]"
                    >
                      View CAIL →
                    </Link>
                  )}
                </SfCard>
              </li>
            ))}
          </ul>
        )}
      </div>
    </VeraPageLayout>
  );
}
