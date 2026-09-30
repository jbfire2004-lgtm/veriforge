"use client";

import type {
  CompanyHecaMetrics,
  CompetencyTrendPoint,
  LeadingMaturityMetrics,
  RegionalPerformanceRow,
  WorkforceStabilityIndicators,
  CorrectiveActionMetrics,
} from "@/lib/hub/industry-safety/types";
import {
  ChartBar,
  ChartColumn,
  ChartTrack,
  ScoreMeter,
} from "./visi-charts";
import {
  visiCardMutedClass,
  visiHeatClass,
  visiMutedClass,
  visiPanelClass,
  visiTitleClass,
} from "./visi-ui";

export function CompanyHecaPanel({
  heca,
  suppressed,
}: {
  heca: CompanyHecaMetrics;
  suppressed?: boolean;
}) {
  if (suppressed) {
    return (
      <section className={visiCardMutedClass}>
        <h3 className={visiTitleClass}>Company HECA rate</h3>
        <p className={`mt-1 ${visiMutedClass}`}>
          Suppressed (n&lt;5 companies).
        </p>
      </section>
    );
  }

  return (
    <section className={visiPanelClass}>
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className={visiTitleClass}>Company HECA rate</h3>
          <p className={`mt-0.5 ${visiMutedClass}`}>
            High-energy exposure across the company cohort
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-semibold tabular-nums tracking-tight text-[#2A2E33]">
            {(heca.companyHecaRate * 100).toFixed(1)}%
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-[#5a6b7c]">
            Controls verified {(heca.controlsVerifiedRate * 100).toFixed(0)}%
          </p>
        </div>
      </header>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {Object.entries(heca.distribution).map(([k, v]) => (
          <div
            key={k}
            className="rounded-lg border border-[#2A2E33]/08 bg-[#f8fafc] px-3 py-2.5"
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-[#94a3b8]">
              {k}
            </p>
            <p className="mt-1 text-sm font-semibold tabular-nums text-[#2A2E33]">
              {(v * 100).toFixed(0)}%
            </p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#e8eef3]">
              <div
                className="h-full rounded-full bg-[#2A2E33]/70"
                style={{ width: `${v * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LeadingMaturityPanel({
  maturity,
  suppressed,
}: {
  maturity: LeadingMaturityMetrics;
  suppressed?: boolean;
}) {
  if (suppressed) {
    return (
      <section className={visiCardMutedClass}>
        <h3 className={visiTitleClass}>Leading indicator maturity</h3>
        <p className={`mt-1 ${visiMutedClass}`}>
          Suppressed (n&lt;5 companies).
        </p>
      </section>
    );
  }

  return (
    <section className={visiPanelClass}>
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className={visiTitleClass}>Leading indicator maturity</h3>
          <p className={`mt-0.5 ${visiMutedClass}`}>
            Company-plane maturity dimensions
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-semibold tabular-nums tracking-tight text-[#2A2E33]">
            {maturity.score}
          </p>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-teal-700">
            {maturity.band}
          </p>
        </div>
      </header>
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {maturity.dimensions.map((cell) => (
          <div
            key={cell.indicator}
            className={`px-3 py-3 ${visiHeatClass(cell.score)}`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-[#2A2E33]">
                {cell.label}
              </span>
              <span className="text-base font-semibold tabular-nums text-[#2A2E33]">
                {cell.score}
              </span>
            </div>
            <ScoreMeter score={cell.score} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function CompetencyTrendChart({
  trend,
  suppressed,
}: {
  trend: CompetencyTrendPoint[];
  suppressed?: boolean;
}) {
  if (suppressed || trend.length === 0) {
    return (
      <section className={visiCardMutedClass}>
        <h3 className={visiTitleClass}>Competency trends</h3>
        <p className={`mt-1 ${visiMutedClass}`}>
          Suppressed (n&lt;5 companies).
        </p>
      </section>
    );
  }

  return (
    <section className={visiPanelClass}>
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className={visiTitleClass}>Competency trends</h3>
          <p className={`mt-0.5 ${visiMutedClass}`}>
            Current rate vs 30-day expiry pressure
          </p>
        </div>
        <div className="flex gap-4 text-[11px] font-medium text-[#5a6b7c]">
          <span className="flex items-center gap-1.5">
            <i className="inline-block h-2 w-2 rounded-full bg-teal-600" />
            Current
          </span>
          <span className="flex items-center gap-1.5">
            <i className="inline-block h-2 w-2 rounded-full bg-amber-500" />
            Expiring 30d
          </span>
        </div>
      </header>
      <ChartTrack heightClass="h-40">
        {trend.map((pt) => (
          <ChartColumn key={pt.period} label={pt.period.slice(5)}>
            <ChartBar
              dual
              heightPct={pt.currentRate * 100}
              tone="teal"
              title={`Current ${pt.currentRate}`}
            />
            <ChartBar
              dual
              heightPct={Math.min(100, pt.expiring30dRate * 800)}
              tone="amber"
              title={`Expiring 30d ${pt.expiring30dRate}`}
            />
          </ChartColumn>
        ))}
      </ChartTrack>
    </section>
  );
}

export function RegionalPerformancePanel({
  regional,
  suppressed,
}: {
  regional: RegionalPerformanceRow[];
  suppressed?: boolean;
}) {
  if (suppressed) {
    return (
      <section className={visiCardMutedClass}>
        <h3 className={visiTitleClass}>Regional performance</h3>
        <p className={`mt-1 ${visiMutedClass}`}>
          Suppressed (n&lt;5 companies).
        </p>
      </section>
    );
  }

  return (
    <section className={visiPanelClass}>
      <header className="mb-4">
        <h3 className={visiTitleClass}>Regional performance</h3>
        <p className={`mt-0.5 ${visiMutedClass}`}>
          Aggregated company cohort by region · no company names
        </p>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#2A2E33]/10 text-[11px] font-medium uppercase tracking-[0.06em] text-[#94a3b8]">
              <th className="py-2.5 pr-3 font-medium">Region</th>
              <th className="py-2.5 pr-3 font-medium">TRIF</th>
              <th className="py-2.5 pr-3 font-medium">HECA</th>
              <th className="py-2.5 pr-3 font-medium">Maturity</th>
              <th className="py-2.5 font-medium">Share</th>
            </tr>
          </thead>
          <tbody>
            {regional.map((r) => (
              <tr
                key={r.code}
                className="border-b border-[#2A2E33]/06 last:border-0"
              >
                <td className="py-2.5 pr-3 font-medium text-[#2A2E33]">
                  {r.label}
                </td>
                <td className="py-2.5 pr-3 tabular-nums text-[#2A2E33]">
                  {r.trif.toFixed(2)}
                </td>
                <td className="py-2.5 pr-3 tabular-nums text-[#5a6b7c]">
                  {(r.hecaRate * 100).toFixed(1)}%
                </td>
                <td className="py-2.5 pr-3 tabular-nums text-[#5a6b7c]">
                  {r.maturityScore}
                </td>
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#eef2f6]">
                      <div
                        className="h-full rounded-full bg-teal-600/80"
                        style={{ width: `${r.companyShare * 100}%` }}
                      />
                    </div>
                    <span className="tabular-nums text-[#5a6b7c]">
                      {(r.companyShare * 100).toFixed(0)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function WorkforceStabilityPanel({
  stability,
  suppressed,
}: {
  stability: WorkforceStabilityIndicators;
  suppressed?: boolean;
}) {
  if (suppressed) {
    return (
      <section className={visiCardMutedClass}>
        <h3 className={visiTitleClass}>Workforce stability</h3>
        <p className={`mt-1 ${visiMutedClass}`}>
          Suppressed (n&lt;5 companies).
        </p>
      </section>
    );
  }

  const rows = [
    {
      label: "Turnover rate",
      value: `${(stability.turnoverRate * 100).toFixed(1)}%`,
      score: Math.max(0, 100 - stability.turnoverRate * 300),
    },
    {
      label: "Median tenure",
      value: `${stability.tenureMedianYears.toFixed(1)} yrs`,
      score: Math.min(100, stability.tenureMedianYears * 12),
    },
    {
      label: "Contractor ratio",
      value: `${(stability.contractorRatio * 100).toFixed(0)}%`,
      score: Math.max(0, 100 - Math.abs(stability.contractorRatio - 0.35) * 200),
    },
    {
      label: "Overtime pressure",
      value: `${(stability.overtimePressure * 100).toFixed(0)}%`,
      score: Math.max(0, 100 - stability.overtimePressure * 200),
    },
    {
      label: "Retention score",
      value: String(stability.retentionScore),
      score: stability.retentionScore,
    },
  ];

  return (
    <section className={visiPanelClass}>
      <header className="mb-4">
        <h3 className={visiTitleClass}>Workforce stability</h3>
        <p className={`mt-0.5 ${visiMutedClass}`}>
          Company-plane workforce health signals
        </p>
      </header>
      <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
        {rows.map((r) => (
          <li
            key={r.label}
            className="rounded-lg border border-[#2A2E33]/08 bg-[#f8fafc] px-3 py-3"
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-[#94a3b8]">
              {r.label}
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-[#2A2E33]">
              {r.value}
            </p>
            <ScoreMeter score={r.score} />
          </li>
        ))}
      </ul>
    </section>
  );
}

const AGING_TONES = ["teal", "teal", "amber", "amber", "rose"] as const;

export function CompanyCapaAgingChart({
  corrective,
  suppressed,
}: {
  corrective: CorrectiveActionMetrics;
  suppressed?: boolean;
}) {
  if (suppressed) {
    return (
      <section className={visiCardMutedClass}>
        <h3 className={visiTitleClass}>Corrective action aging</h3>
        <p className={`mt-1 ${visiMutedClass}`}>
          Suppressed (n&lt;5 companies).
        </p>
      </section>
    );
  }

  const max = Math.max(1, ...corrective.aging.map((a) => a.count));

  return (
    <section className={visiPanelClass}>
      <header className="mb-4">
        <h3 className={visiTitleClass}>Corrective action aging</h3>
        <p className={`mt-0.5 ${visiMutedClass}`}>
          On-time {(corrective.onTimeRate * 100).toFixed(0)}% · open avg{" "}
          {corrective.openAvg}
        </p>
      </header>
      <ChartTrack heightClass="h-40">
        {corrective.aging.map((b, i) => (
          <ChartColumn key={b.bucket} label={b.bucket}>
            <ChartBar
              heightPct={(b.count / max) * 100}
              tone={AGING_TONES[i] ?? "amber"}
              title={`${b.bucket}: ${b.count}`}
            />
          </ChartColumn>
        ))}
      </ChartTrack>
    </section>
  );
}
