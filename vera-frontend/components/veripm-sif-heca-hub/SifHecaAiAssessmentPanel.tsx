"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  analyzeSifHecaScope,
  buildSifHecaOrchestratorFromAnalysis,
  type SifHecaScopeAnalysisResponse,
} from "@/lib/sif-heca";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";
import { VsStatusBadge } from "@/components/verisuite-intelligence-ui";
import { Button } from "@/components/ui/button";

type Props = {
  companyId: number;
  projectId: number;
};

/**
 * Inline AI HECA assessment — calls analyze-scope and surfaces energy / SIF / controls.
 */
export function SifHecaAiAssessmentPanel({ companyId, projectId }: Props) {
  const [title, setTitle] = useState("");
  const [scope, setScope] = useState("");
  const [result, setResult] = useState<SifHecaScopeAnalysisResponse | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canRun = title.trim().length > 2 && scope.trim().length > 8;

  const orchestrator = useMemo(
    () =>
      result
        ? buildSifHecaOrchestratorFromAnalysis(
            result,
            title.trim() || "HECA assessment",
          )
        : null,
    [result, title],
  );

  async function run() {
    if (!canRun) return;
    setBusy(true);
    setError(null);
    try {
      const res = await analyzeSifHecaScope({
        companyId,
        projectId,
        title: title.trim(),
        workScope: scope.trim(),
        jobDescription: scope.trim(),
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Assessment failed");
    } finally {
      setBusy(false);
    }
  }

  const q = `projectId=${projectId}&companyId=${companyId}`;

  return (
    <div className="vs-panel space-y-3 p-4">
      <p className="vs-eyebrow">AI HECA assessor</p>
      <p className="text-xs" style={{ color: VS_COLORS.muted }}>
        Describe the activity — the engine infers energy types, HECA category,
        SIF protocol, and required controls.
      </p>
      <input
        className="w-full rounded border bg-transparent px-3 py-2 text-sm"
        style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
        placeholder="Activity title *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="min-h-[100px] w-full rounded border bg-transparent px-3 py-2 text-sm"
        style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
        placeholder="Work scope, location, equipment, and environment…"
        value={scope}
        onChange={(e) => setScope(e.target.value)}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          disabled={!canRun || busy}
          onClick={() => void run()}
        >
          {busy ? "Assessing…" : "Run AI HECA assessment"}
        </Button>
        <Link
          href={`/pm/sif-heca/evaluate?${q}`}
          className="text-xs font-semibold"
          style={{ color: VS_COLORS.blue }}
        >
          Full evaluator →
        </Link>
      </div>
      {error ? (
        <p className="text-xs" style={{ color: VS_COLORS.critical }}>
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="space-y-3 border-t pt-3" style={{ borderColor: VS_COLORS.border }}>
          <div className="flex flex-wrap gap-2">
            <VsStatusBadge
              tone={
                result.analysis.sif_protocol.applies ? "critical" : "positive"
              }
            >
              {result.analysis.sif_protocol.applies
                ? "SIF potential"
                : "Routine SIF"}
            </VsStatusBadge>
            <VsStatusBadge
              tone={result.analysis.heca_assessment.high_energy ? "caution" : "info"}
            >
              {result.analysis.heca_assessment.primary_label}
            </VsStatusBadge>
            <VsStatusBadge tone="neutral">
              Score {result.evaluation.sif_score}
            </VsStatusBadge>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: VS_COLORS.muted }}>
            {result.analysis.heca_assessment.narrative}
          </p>
          {result.analysis.energy_types.length > 0 ? (
            <div>
              <p className="vs-eyebrow">Inferred energy</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {result.analysis.energy_types.map((e) => (
                  <VsStatusBadge key={e} tone="info">
                    {e}
                  </VsStatusBadge>
                ))}
              </div>
            </div>
          ) : null}
          {orchestrator ? (
            <div>
              <p className="vs-eyebrow">Suggested actions</p>
              <ul className="mt-1.5 space-y-1">
                {orchestrator.actions.slice(0, 4).map((a) => (
                  <li
                    key={a}
                    className="text-xs"
                    style={{ color: VS_COLORS.white }}
                  >
                    · {a}
                  </li>
                ))}
              </ul>
              <Link
                href={`/pm/action-management?${q}&source=heca`}
                className="mt-2 inline-block text-xs font-semibold"
                style={{ color: VS_COLORS.blue }}
              >
                Send to Action Management →
              </Link>
            </div>
          ) : null}

          {(result.csra ?? result.evaluation.csra) ? (
            <div>
              <p className="vs-eyebrow">CSRA summary</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <VsStatusBadge
                  tone={
                    (result.csra ?? result.evaluation.csra)!.document.summary
                      .highEnergy
                      ? "critical"
                      : "positive"
                  }
                >
                  {(result.csra ?? result.evaluation.csra)!.document.summary
                    .highEnergy
                    ? "High energy"
                    : "No HE"}
                </VsStatusBadge>
                <VsStatusBadge tone="info">
                  Direct{" "}
                  {
                    (result.csra ?? result.evaluation.csra)!.controls
                      .directCount
                  }
                </VsStatusBadge>
                <VsStatusBadge tone="neutral">
                  Alt{" "}
                  {
                    (result.csra ?? result.evaluation.csra)!.controls
                      .alternativeCount
                  }
                </VsStatusBadge>
                <VsStatusBadge
                  tone={
                    (result.csra ?? result.evaluation.csra)!.document.summary
                      .readyForWork
                      ? "positive"
                      : "caution"
                  }
                >
                  {(result.csra ?? result.evaluation.csra)!.document.summary
                    .readyForWork
                    ? "Ready"
                    : "Controls gap"}
                </VsStatusBadge>
              </div>
              <ul className="mt-2 space-y-1">
                {(result.csra ?? result.evaluation.csra)!.recommendations
                  .slice(0, 3)
                  .map((r) => (
                    <li
                      key={r.id}
                      className="text-xs"
                      style={{ color: VS_COLORS.muted }}
                    >
                      · [{r.controlClass}] {r.description}
                    </li>
                  ))}
              </ul>
              <Link
                href={`/pm/sif-heca/evaluate?${q}`}
                className="mt-2 inline-block text-xs font-semibold"
                style={{ color: VS_COLORS.blue }}
              >
                Open full HECA assessment document →
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
