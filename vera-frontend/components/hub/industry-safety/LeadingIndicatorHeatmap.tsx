"use client";

import type { LeadingIndicatorMetrics } from "@/lib/hub/industry-safety/types";
import { ScoreMeter } from "./visi-charts";
import {
  visiCardMutedClass,
  visiHeatClass,
  visiMutedClass,
  visiPanelClass,
  visiTitleClass,
} from "./visi-ui";

type Props = { leading: LeadingIndicatorMetrics; suppressed?: boolean };

export function LeadingIndicatorHeatmap({ leading, suppressed }: Props) {
  if (suppressed) {
    return (
      <section className={visiCardMutedClass}>
        <h3 className={visiTitleClass}>Leading indicators</h3>
        <p className={`mt-1 ${visiMutedClass}`}>Suppressed (n&lt;5 projects).</p>
      </section>
    );
  }

  return (
    <section className={visiPanelClass}>
      <header className="mb-4">
        <h3 className={visiTitleClass}>Leading indicators</h3>
        <p className={`mt-0.5 ${visiMutedClass}`}>
          Cohort scores 0–100 · project plane
        </p>
      </header>
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {leading.heatmap.map((cell) => (
          <div
            key={cell.indicator}
            className={`px-3 py-3 pr-3 ${visiHeatClass(cell.score)}`}
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
