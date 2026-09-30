/** Shared chart primitives for Industry Safety graphics */

import type { ReactNode } from "react";

export function ChartTrack({
  children,
  heightClass = "h-40",
}: {
  children: ReactNode;
  heightClass?: string;
}) {
  return (
    <div
      className={`relative flex ${heightClass} items-end gap-2.5 border-b border-[#2A2E33]/08 pb-1`}
    >
      {/* subtle horizontal guides */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 bottom-1 flex flex-col justify-between"
      >
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border-t border-[#2A2E33]/[0.04]" />
        ))}
      </div>
      {children}
    </div>
  );
}

export function ChartColumn({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="relative z-[1] flex min-w-0 flex-1 flex-col items-center gap-1.5">
      <div className="flex h-full w-full items-end justify-center gap-1">
        {children}
      </div>
      <span className="text-[10px] font-medium tabular-nums text-[#94a3b8]">
        {label}
      </span>
    </div>
  );
}

export function ChartBar({
  heightPct,
  tone = "teal",
  title,
  dual,
}: {
  heightPct: number;
  tone?: "teal" | "rose" | "amber" | "navy" | "slate";
  title?: string;
  dual?: boolean;
}) {
  const tones: Record<string, string> = {
    teal: "bg-gradient-to-t from-[#247A78] to-[#2F8F8C]",
    rose: "bg-gradient-to-t from-[#8F2E2E] to-[#B33A3A]",
    amber: "bg-gradient-to-t from-[#A8842F] to-[#C89F3D]",
    navy: "bg-gradient-to-t from-[#1C1F24] to-[#3B3F45]",
    slate: "bg-gradient-to-t from-[#3B3F45] to-[#5A6169]",
  };
  const h = Math.max(3, Math.min(100, heightPct));
  return (
    <div
      className={`${dual ? "w-[42%]" : "w-[70%] max-w-10"} rounded-t-md ${tones[tone]} shadow-[0_-1px_0_rgba(255,255,255,0.15)_inset]`}
      style={{ height: `${h}%` }}
      title={title}
    />
  );
}

export function ScoreMeter({
  score,
  max = 100,
  tone,
}: {
  score: number;
  max?: number;
  tone?: "teal" | "amber" | "rose";
}) {
  const pct = Math.max(0, Math.min(100, (score / max) * 100));
  const autoTone =
    tone ?? (pct >= 75 ? "teal" : pct >= 40 ? "amber" : "rose");
  const fill: Record<string, string> = {
    teal: "bg-teal-600",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
  };
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#eef2f6]">
      <div
        className={`h-full rounded-full ${fill[autoTone]} transition-[width] duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function ProgressRow({
  label,
  share,
  tone = "navy",
}: {
  label: string;
  share: number;
  tone?: "teal" | "navy" | "amber" | "rose";
}) {
  const fills: Record<string, string> = {
    teal: "bg-gradient-to-r from-[#247A78] to-[#2F8F8C]",
    navy: "bg-gradient-to-r from-[#2A2E33] to-[#1E6FB8]",
    amber: "bg-gradient-to-r from-[#A8842F] to-[#C89F3D]",
    rose: "bg-gradient-to-r from-[#8F2E2E] to-[#B33A3A]",
  };
  const pct = Math.max(0, Math.min(100, share * 100));
  return (
    <li>
      <div className="mb-1 flex justify-between text-xs">
        <span className="font-medium text-[#2A2E33]">{label}</span>
        <span className="tabular-nums text-[#5a6b7c]">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#eef2f6]">
        <div
          className={`h-full rounded-full ${fills[tone]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </li>
  );
}

export const chartLegendDot = (color: string) =>
  `inline-block h-2 w-2 rounded-full ${color}`;

/** Side-by-side self vs industry metric block */
export function CompareMetricBlock({
  label,
  selfValue,
  industryValue,
  selfSub,
  industrySub,
  unit,
}: {
  label: string;
  selfValue: string;
  industryValue: string | null;
  selfSub?: string;
  industrySub?: string;
  unit?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#2A2E33]/10 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#94a3b8]">
        {label}
        {unit ? (
          <span className="ml-1 font-normal normal-case tracking-normal text-[#94a3b8]">
            · {unit}
          </span>
        ) : null}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-teal-700">
            Your company
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-[#2A2E33]">
            {selfValue}
          </p>
          {selfSub ? (
            <p className="mt-0.5 text-xs tabular-nums text-[#5a6b7c]">{selfSub}</p>
          ) : null}
        </div>
        <div className="border-l border-[#2A2E33]/08 pl-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-[#94a3b8]">
            Industry
          </p>
          {industryValue != null ? (
            <>
              <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-[#2A2E33]">
                {industryValue}
              </p>
              {industrySub ? (
                <p className="mt-0.5 text-xs tabular-nums text-[#5a6b7c]">
                  {industrySub}
                </p>
              ) : null}
            </>
          ) : (
            <p className="mt-2 text-sm text-amber-800">n&lt;5</p>
          )}
        </div>
      </div>
    </div>
  );
}

/** Dual-series seasonal / period comparison bars */
export function DualSeriesChart({
  points,
}: {
  points: Array<{
    period: string;
    self: number;
    industry: number | null;
  }>;
}) {
  const max = Math.max(
    0.01,
    ...points.flatMap((p) =>
      [p.self, p.industry].filter((v): v is number => v != null && v > 0),
    ),
  );

  return (
    <div>
      <div className="mb-3 flex gap-4 text-[11px] font-medium text-[#5a6b7c]">
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2 w-2 rounded-full bg-teal-600" />
          Your company
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2 w-2 rounded-full bg-[#2A2E33]" />
          Industry
        </span>
      </div>
      <ChartTrack heightClass="h-44">
        {points.map((pt) => (
          <ChartColumn
            key={pt.period}
            label={pt.period.length > 7 ? pt.period.slice(5) : pt.period}
          >
            <ChartBar
              dual
              heightPct={(pt.self / max) * 100}
              tone="teal"
              title={`Yours ${pt.self.toFixed(2)}`}
            />
            <ChartBar
              dual
              heightPct={
                pt.industry != null ? (pt.industry / max) * 100 : 3
              }
              tone={pt.industry != null ? "navy" : "slate"}
              title={
                pt.industry != null
                  ? `Industry ${pt.industry.toFixed(2)}`
                  : "Suppressed"
              }
            />
          </ChartColumn>
        ))}
      </ChartTrack>
    </div>
  );
}
