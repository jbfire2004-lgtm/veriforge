"use client";

import type { HecaMetrics } from "@/lib/hub/industry-safety/types";
import { ChartBar, ChartColumn, ChartTrack } from "./visi-charts";
import {
  visiCardMutedClass,
  visiMutedClass,
  visiPanelClass,
  visiTitleClass,
} from "./visi-ui";

type Props = { heca: HecaMetrics; suppressed?: boolean };

export function HecaTrendChart({ heca, suppressed }: Props) {
  if (suppressed) {
    return (
      <EmptyChart
        title="HECA trends"
        note="Hidden until cohort reaches 5 projects."
      />
    );
  }

  const max = Math.max(
    0.01,
    ...heca.trend.map((p) => Math.max(p.highEnergyRate, p.controlsVerifiedRate)),
  );

  return (
    <section className={visiPanelClass}>
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className={visiTitleClass}>HECA trend</h3>
          <p className={`mt-0.5 ${visiMutedClass}`}>
            High-energy rate vs controls verified
          </p>
        </div>
        <div className="flex gap-4 text-[11px] font-medium text-[#5a6b7c]">
          <span className="flex items-center gap-1.5">
            <i className="inline-block h-2 w-2 rounded-full bg-rose-500" />
            High energy
          </span>
          <span className="flex items-center gap-1.5">
            <i className="inline-block h-2 w-2 rounded-full bg-teal-600" />
            Controls verified
          </span>
        </div>
      </header>

      <ChartTrack heightClass="h-44">
        {heca.trend.map((pt) => (
          <ChartColumn key={pt.period} label={pt.period.slice(5)}>
            <ChartBar
              dual
              heightPct={(pt.highEnergyRate / max) * 100}
              tone="rose"
              title={`High energy ${pt.highEnergyRate}`}
            />
            <ChartBar
              dual
              heightPct={(pt.controlsVerifiedRate / max) * 100}
              tone="teal"
              title={`Controls ${pt.controlsVerifiedRate}`}
            />
          </ChartColumn>
        ))}
      </ChartTrack>

      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
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
                className="h-full rounded-full bg-teal-600/80"
                style={{ width: `${v * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function EmptyChart({ title, note }: { title: string; note: string }) {
  return (
    <section className={visiCardMutedClass}>
      <h3 className={visiTitleClass}>{title}</h3>
      <p className={`mt-1 ${visiMutedClass}`}>{note}</p>
    </section>
  );
}
