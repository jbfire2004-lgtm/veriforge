import type { SgaeAssessmentResult } from "@/lib/assessment-engines-types";
import {
  formatAssessmentEvaluatedAt,
  smartGapCategoryEntries,
  smartGapGapsFromResult,
  smartGapRecommendationsFromResult,
} from "@/lib/assessment-readiness-display";
import {
  AssessmentScoreBar,
  AssessmentStatusBadge,
} from "@/components/core/AssessmentStatusBadge";

export function SmartGapAssessmentDetail({
  result,
  evaluatedAt,
}: {
  result: SgaeAssessmentResult;
  evaluatedAt?: string | null;
}) {
  const categories = smartGapCategoryEntries(result);
  const gaps = smartGapGapsFromResult(result);
  const recommendations = smartGapRecommendationsFromResult(result);
  const when = formatAssessmentEvaluatedAt(evaluatedAt);

  return (
    <div className="space-y-4" data-testid="sga-assessment-detail">
      <div className="flex flex-wrap items-center gap-2">
        <AssessmentStatusBadge status={result.overallStatus} />
        <span className="text-sm font-semibold text-slate-900">
          {result.overallGapScore}/100
        </span>
        {when ? (
          <span className="text-xs text-slate-500">Evaluated {when}</span>
        ) : null}
      </div>

      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Category scores
        </h4>
        <div className="mt-2 space-y-3">
          {categories.map((row) => (
            <AssessmentScoreBar
              key={row.category}
              label={row.category}
              score={row.score}
              note={row.notes}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <ComplianceCard
          title="Legislative compliance"
          block={result.legislativeCompliance}
        />
        <ComplianceCard
          title="Hiring client compliance"
          block={result.hiringClientCompliance}
        />
      </section>

      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Gaps ({gaps.length})
        </h4>
        {gaps.length ? (
          <ul className="mt-2 space-y-2">
            {gaps.map((gap) => (
              <li
                key={`${gap.kind}-${gap.label}`}
                className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-slate-900">{gap.label}</span>
                  <span className="text-xs text-slate-600">{gap.score}%</span>
                </div>
                <p className="mt-1 text-xs text-slate-600">{gap.detail}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-500">No material gaps identified.</p>
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
                  <span className="text-xs text-slate-500">{item.category}</span>
                  <span className="text-xs text-slate-500">{item.sourceEngine}</span>
                  {item.blockingForOnboarding ? (
                    <span className="text-xs font-medium text-red-700">
                      Blocks onboarding
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
          <p className="mt-2 text-sm text-slate-500">No roadmap items at this time.</p>
        )}
      </section>
    </div>
  );
}

function ComplianceCard({
  title,
  block,
}: {
  title: string;
  block: { assessment: string; notes: string };
}) {
  return (
    <article className="rounded-lg border border-slate-100 bg-slate-50 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-sm font-medium text-slate-800">{title}</h4>
        <AssessmentStatusBadge status={block.assessment} />
      </div>
      <p className="mt-2 text-xs text-slate-600">{block.notes}</p>
    </article>
  );
}
