"use client";

import { useState } from "react";
import {
  generateSafetyCultureEngineForScope,
  type AnalyticsSafetyCultureEngineOutput,
} from "@/lib/pm-predictive-safety-analytics";
import { WorkspaceSection } from "@/components/theme/workspace";
import { Button } from "@/components/ui/button";

export function AnalyticsSafetyCultureEnginePanel({
  companyId,
  projectId,
}: {
  companyId: number;
  projectId?: number;
}) {
  const [output, setOutput] = useState<AnalyticsSafetyCultureEngineOutput | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const out = await generateSafetyCultureEngineForScope(companyId, projectId);
      setOutput(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Engine failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <WorkspaceSection
      title="Safety culture engine"
      description="Diagnosis, culture lens, and leadership / frontline communication packs"
    >
      <div className="mb-4">
        <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void run()}>
          {busy ? "Analyzing…" : "Run ANALYTICS_SAFETY_CULTURE_ENGINE"}
        </Button>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </div>

      {output ? (
        <div className="space-y-4 text-sm">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-[#64748b]">Executive brief</p>
              <p className="text-[#5a6b7c]">{output.exec_brief}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-[#64748b]">Frontline brief</p>
              <p className="text-[#5a6b7c]">{output.frontline_brief}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-[#64748b]">Strengths</p>
              <ul className="list-disc pl-5 text-[#5a6b7c]">
                {output.diagnosis.strengths.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-[#64748b]">Weak spots</p>
              <ul className="list-disc pl-5 text-[#5a6b7c]">
                {output.diagnosis.weak_spots.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-[#64748b]">Culture insights</p>
            <ul className="space-y-1 text-[#5a6b7c]">
              <li>
                <span className="font-medium">Reporting:</span> {output.culture_insights.reporting_culture}
              </li>
              <li>
                <span className="font-medium">Supervision:</span>{" "}
                {output.culture_insights.supervisory_engagement}
              </li>
              <li>
                <span className="font-medium">Learning:</span> {output.culture_insights.learning_culture}
              </li>
            </ul>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-[#64748b]">Quick wins (30–60d)</p>
              <ul className="list-disc pl-5 text-[#5a6b7c]">
                {output.quick_wins.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-[#64748b]">Strategic (6–18mo)</p>
              <ul className="list-disc pl-5 text-[#5a6b7c]">
                {output.strategic_initiatives.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </WorkspaceSection>
  );
}
