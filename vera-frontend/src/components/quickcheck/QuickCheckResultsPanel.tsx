"use client";

import type { QuickCheckRiskLevel, QuickCheckResult } from "@/lib/quickcheck-api";

const RISK_STYLES: Record<QuickCheckRiskLevel, string> = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-900",
  yellow: "border-amber-200 bg-amber-50 text-amber-950",
  red: "border-red-200 bg-red-50 text-red-900",
};

export function RiskLevelBadge({
  level,
  label,
}: {
  level: QuickCheckRiskLevel;
  label?: string;
}) {
  return (
    <span
      className={`inline-flex border px-2 py-0.5 text-xs font-semibold uppercase ${RISK_STYLES[level]}`}
    >
      {label || level}
    </span>
  );
}

export function QuickCheckResultsPanel({
  result,
  compact = false,
}: {
  result: QuickCheckResult;
  compact?: boolean;
}) {
  const b = result.breakdown;

  return (
    <div className="space-y-4">
      <div className={`border px-4 py-3 ${RISK_STYLES[result.riskLevel]}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-xs uppercase opacity-80">Compliance score</div>
            <div className="text-3xl font-semibold tabular-nums">
              {result.complianceScore}
            </div>
          </div>
          <div className="text-right">
            <RiskLevelBadge
              level={result.riskLevel}
              label={result.riskLabel}
            />
            <p className="mt-1 max-w-xs text-xs opacity-90">
              {result.riskDescription}
            </p>
          </div>
        </div>
      </div>

      {!compact ? (
        <ul className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <li className="border border-zinc-200 px-3 py-2">
            Documents ({Math.round(b.weights.documents * 100)}%):{" "}
            <strong>{b.documentsScore}</strong>
          </li>
          <li className="border border-zinc-200 px-3 py-2">
            Audits ({Math.round(b.weights.audits * 100)}%):{" "}
            <strong>{b.auditsScore}</strong>
          </li>
          <li className="border border-zinc-200 px-3 py-2">
            Insurance ({Math.round(b.weights.insurance * 100)}%):{" "}
            <strong>{b.insuranceScore}</strong>
            <span className="text-xs text-zinc-500"> · {b.insuranceStatus}</span>
          </li>
          <li className="border border-zinc-200 px-3 py-2">
            PVS ({Math.round(b.weights.pvs * 100)}%):{" "}
            <strong>{b.pvsScore}</strong>
          </li>
        </ul>
      ) : null}

      <section>
        <h3 className="mb-2 text-sm font-medium uppercase text-zinc-500">
          Missing items ({result.missingItems.length})
        </h3>
        {result.missingItems.length ? (
          <ul className="divide-y divide-zinc-200 border border-zinc-200 text-sm">
            {result.missingItems.map((m) => (
              <li
                key={m.code}
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
              >
                <span>{m.label}</span>
                <span className="text-xs uppercase text-zinc-500">
                  {m.severity} · {m.source}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            No missing items detected.
          </p>
        )}
      </section>

      {!compact ? (
        <p className="text-xs text-zinc-500">
          Run {result.runId.slice(0, 8)} · {result.source} ·{" "}
          {new Date(result.generatedAt).toLocaleString()}
        </p>
      ) : null}
    </div>
  );
}
