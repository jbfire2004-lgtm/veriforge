"use client";

import type {
  CorrectiveActionMetrics,
  RootCauseSlice,
  SeasonalPoint,
} from "@/lib/hub/industry-safety/types";
import {
  ChartBar,
  ChartColumn,
  ChartTrack,
  ProgressRow,
} from "./visi-charts";
import {
  visiCardMutedClass,
  visiMutedClass,
  visiPanelClass,
  visiTitleClass,
} from "./visi-ui";

export function SeasonalRiskChart({
  seasonal,
  suppressed,
}: {
  seasonal: SeasonalPoint[];
  suppressed?: boolean;
}) {
  if (suppressed) {
    return (
      <section className={visiCardMutedClass}>
        <h3 className={visiTitleClass}>Seasonal risk patterns</h3>
        <p className={`mt-1 ${visiMutedClass}`}>Suppressed (n&lt;5 projects).</p>
      </section>
    );
  }

  const trif = seasonal.filter((s) => s.metric === "trif");
  const max = Math.max(0.01, ...trif.map((s) => s.value ?? 0));

  return (
    <section className={visiPanelClass}>
      <header className="mb-4">
        <h3 className={visiTitleClass}>Seasonal risk patterns</h3>
        <p className={`mt-0.5 ${visiMutedClass}`}>
          TRIF by period · per 200,000 hours
        </p>
      </header>
      <ChartTrack heightClass="h-40">
        {trif.map((pt) => (
          <ChartColumn key={pt.period} label={pt.period.slice(5)}>
            <ChartBar
              heightPct={((pt.value ?? 0) / max) * 100}
              tone="navy"
              title={`${pt.period}: ${pt.value}`}
            />
          </ChartColumn>
        ))}
      </ChartTrack>
    </section>
  );
}

export function RootCauseDistribution({
  rootCause,
  suppressed,
}: {
  rootCause: RootCauseSlice[];
  suppressed?: boolean;
}) {
  if (suppressed) {
    return (
      <section className={visiCardMutedClass}>
        <h3 className={visiTitleClass}>Root cause distribution</h3>
        <p className={`mt-1 ${visiMutedClass}`}>Suppressed (n&lt;5 projects).</p>
      </section>
    );
  }

  return (
    <section className={visiPanelClass}>
      <header className="mb-4">
        <h3 className={visiTitleClass}>Root cause distribution</h3>
        <p className={`mt-0.5 ${visiMutedClass}`}>
          Aggregated project cohort · no entity IDs
        </p>
      </header>
      <ul className="space-y-3">
        {rootCause.map((r, i) => (
          <ProgressRow
            key={r.code}
            label={r.label}
            share={r.share}
            tone={i === 0 ? "rose" : i === 1 ? "amber" : "navy"}
          />
        ))}
      </ul>
    </section>
  );
}

const AGING_TONES = ["teal", "teal", "amber", "amber", "rose"] as const;

export function CorrectiveActionAgingChart({
  corrective,
  suppressed,
}: {
  corrective: CorrectiveActionMetrics;
  suppressed?: boolean;
}) {
  if (suppressed) {
    return (
      <section className={visiCardMutedClass}>
        <h3 className={visiTitleClass}>Corrective action closure aging</h3>
        <p className={`mt-1 ${visiMutedClass}`}>Suppressed (n&lt;5 projects).</p>
      </section>
    );
  }

  const max = Math.max(1, ...corrective.aging.map((a) => a.count));

  return (
    <section className={visiPanelClass}>
      <header className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className={visiTitleClass}>Corrective action closure aging</h3>
          <p className={`mt-0.5 ${visiMutedClass}`}>
            On-time {(corrective.onTimeRate * 100).toFixed(0)}% · open avg{" "}
            {corrective.openAvg}
          </p>
        </div>
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
