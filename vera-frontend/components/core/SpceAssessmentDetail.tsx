import type { SpceAssessmentResult } from "@/lib/assessment-engines-types";
import {
  formatAssessmentEvaluatedAt,
  spceCategoryScores,
  spceGapSummary,
  spceGapsFromResult,
  spceRecommendationsFromResult,
  type AssessmentTrendPoint,
} from "@/lib/assessment-readiness-display";
import { AssessmentScoreTrend } from "@/components/core/AssessmentScoreTrend";
import {
  AssessmentScoreBar,
  AssessmentStatusBadge,
} from "@/components/core/AssessmentStatusBadge";

export function SpceAssessmentDetail({
  result,
  evaluatedAt,
  trend,
}: {
  result: SpceAssessmentResult;
  evaluatedAt?: string | null;
  trend?: AssessmentTrendPoint[];
}) {
  const categories = spceCategoryScores(result);
  const gaps = spceGapsFromResult(result);
  const recommendations = spceRecommendationsFromResult(result);
  const when = formatAssessmentEvaluatedAt(evaluatedAt);

  return (
    <div className="space-y-4" data-testid="spce-assessment-detail">
      <div className="flex flex-wrap items-center gap-2">
        <AssessmentStatusBadge status={result.overallStatus} />
        <span className="text-sm font-semibold text-slate-900">
          {result.overallScore}/100
        </span>
        {when ? (
          <span className="text-xs text-slate-500">Evaluated {when}</span>
        ) : null}
      </div>

      {trend?.length ? <AssessmentScoreTrend points={trend} label="SPCE trend" /> : null}

      {categories.length ? (
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Key dimensions
          </h4>
          <div className="mt-2 space-y-3">
            {categories.map((row) => (
              <AssessmentScoreBar
                key={row.category}
                label={`${row.category} (${row.count})`}
                score={row.score}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Gaps ({gaps.length})
        </h4>
        {gaps.length ? (
          <ul className="mt-2 space-y-2">
            {gaps.map((gap) => (
              <li
                key={gap.requirementId}
                className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-slate-900">{gap.category}</span>
                  <span className="text-xs text-slate-500">{gap.type}</span>
                  <AssessmentStatusBadge status={gap.status} />
                  <span className="text-xs text-slate-600">{gap.score}%</span>
                </div>
                <p className="mt-1 text-xs text-slate-600">{spceGapSummary(gap)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-500">No requirement gaps identified.</p>
        )}
      </section>

      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Recommendations ({recommendations.length})
        </h4>
        {recommendations.length ? (
          <ul className="mt-2 space-y-2">
            {recommendations.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-slate-100 px-3 py-2 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <AssessmentStatusBadge status={item.priority} />
                  {item.blockingForPrequalification ? (
                    <span className="text-xs font-medium text-red-700">
                      Blocks prequalification
                    </span>
                  ) : null}
                  <span className="text-xs text-slate-500">
                    Due in {item.recommendedDueDays} days
                  </span>
                </div>
                <p className="mt-1 text-slate-700">{item.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-500">No corrective actions required.</p>
        )}
      </section>
    </div>
  );
}
