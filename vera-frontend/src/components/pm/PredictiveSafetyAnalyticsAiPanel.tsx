"use client";

import { useCallback, useState } from "react";
import { TrendingUp } from "lucide-react";
import {
  analyzePredictiveSafety,
  type PredictiveSafetyAnalyticsAiResult,
} from "@/lib/predictive-safety-analytics-ai";
import { RISK_LEVEL_COLORS } from "@/lib/pm-predictive-safety-analytics";
import { SfButton } from "@/src/components/safety-forms/ui";

type PredictiveSafetyAnalyticsAiPanelProps = {
  companyId: number;
  projectId?: number;
};

export function PredictiveSafetyAnalyticsAiPanel({
  companyId,
  projectId,
}: PredictiveSafetyAnalyticsAiPanelProps) {
  const [result, setResult] = useState<PredictiveSafetyAnalyticsAiResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(() => {
    setBusy(true);
    setError(null);
    void analyzePredictiveSafety(companyId, projectId)
      .then(setResult)
      .catch((e) => setError(e instanceof Error ? e.message : "Analysis failed"))
      .finally(() => setBusy(false));
  }, [companyId, projectId]);

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-slate-800" />
          <h2 className="font-medium text-slate-900">Predictive Safety Intelligence</h2>
        </div>
        <SfButton type="button" size="sm" variant="secondary" disabled={busy} onClick={() => void run()}>
          {busy ? "Analyzing…" : "Run predictive analysis"}
        </SfButton>
      </div>

      {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}

      {result ? (
        <div className="space-y-4 text-sm">
          <p className="text-xs text-slate-600">{result.field_summary}</p>

          {result.risk_forecast.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-slate-700">Risk forecast</p>
              <ul className="space-y-1">
                {result.risk_forecast.slice(0, 6).map((item) => (
                  <li
                    key={`${item.entity_type}-${item.entity_id}`}
                    className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2"
                  >
                    <span>
                      <span className="font-medium">{item.label}</span>
                      <span className="ml-2 text-xs text-slate-500">({item.entity_type})</span>
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${RISK_LEVEL_COLORS[item.risk_level]}`}
                    >
                      {item.risk_score}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.leading_indicators.filter((i) => i.severity === "critical").length > 0 ? (
            <div className="rounded border border-red-200 bg-red-50 p-3">
              <p className="text-xs font-semibold uppercase text-red-900">Critical leading indicators</p>
              <ul className="mt-1 list-disc pl-4 text-xs text-red-800">
                {result.leading_indicators
                  .filter((i) => i.severity === "critical")
                  .map((i) => (
                    <li key={i.description}>{i.description}</li>
                  ))}
              </ul>
            </div>
          ) : null}

          {result.recommended_interventions.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-slate-700">Recommended interventions</p>
              <ul className="space-y-1 text-xs">
                {result.recommended_interventions.slice(0, 5).map((item) => (
                  <li key={item.title} className="rounded border border-teal-100 bg-white px-2 py-1">
                    [{item.priority}] {item.title}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
