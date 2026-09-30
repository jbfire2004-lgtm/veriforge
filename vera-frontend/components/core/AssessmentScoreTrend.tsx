"use client";

import {
  buildAssessmentScoreTrend,
  formatAssessmentEvaluatedAt,
  type AssessmentTrendPoint,
} from "@/lib/assessment-readiness-display";

export function AssessmentScoreTrend({
  points,
  label = "Score trend",
}: {
  points: AssessmentTrendPoint[];
  label?: string;
}) {
  const trend = buildAssessmentScoreTrend(points);
  if (!trend.points.length) return null;

  const max = Math.max(...trend.points.map((p) => p.score), 100);

  return (
    <section data-testid="assessment-score-trend">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </h4>
        {trend.delta != null ? (
          <span
            className={`text-xs font-medium ${
              trend.direction === "up"
                ? "text-emerald-700"
                : trend.direction === "down"
                  ? "text-red-700"
                  : "text-slate-600"
            }`}
          >
            {trend.delta > 0 ? "+" : ""}
            {trend.delta} vs prior run
          </span>
        ) : (
          <span className="text-xs text-slate-500">Single run on file</span>
        )}
      </div>
      <div className="mt-2 flex items-end gap-2">
        {trend.points.map((point) => {
          const height = Math.max(8, Math.round((point.score / max) * 48));
          const when = formatAssessmentEvaluatedAt(point.evaluatedAt);
          return (
            <div
              key={point.evaluatedAt}
              className="flex min-w-0 flex-1 flex-col items-center gap-1"
              title={when ?? undefined}
            >
              <div
                className="w-full rounded-t bg-teal-600/80"
                style={{ height }}
                aria-hidden
              />
              <span className="text-[10px] font-medium text-slate-700">{point.score}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
