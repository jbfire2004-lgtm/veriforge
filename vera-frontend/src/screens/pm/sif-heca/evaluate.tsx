"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  analyzeSifHecaScope,
  buildSifHecaOrchestratorFromAnalysis,
  scoreSifHeca,
  type SifHecaScopeAnalysisResponse,
} from "@/lib/sif-heca";
import { VeraOrchestratorPanel } from "@/src/components/pm/VeraOrchestratorPanel";
import { JhaEnergyWheelPanel } from "@/src/components/pm/JhaEnergyWheelPanel";
import { HecaCsraDocumentPanel } from "@/components/veripm-sif-heca-hub/HecaCsraDocumentPanel";
import { VeraPageLayout } from "@/src/components/navigation";
import { SfButton, SfCard, SfInput } from "@/src/components/safety-forms/ui";
import { SfFloatingTextarea } from "@/src/components/safety-forms/ui/SfFloatingTextarea";

function categoryBadgeClass(category: string): string {
  if (category === "critical") return "bg-red-100 text-red-900 border-red-300";
  if (category === "high") return "bg-orange-100 text-orange-900 border-orange-300";
  if (category === "medium") return "bg-amber-100 text-amber-900 border-amber-300";
  return "bg-green-100 text-green-900 border-green-300";
}

export default function SifHecaEvaluatePage({
  projectId = 1,
  companyId = 1,
}: {
  projectId?: number;
  companyId?: number;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [workScope, setWorkScope] = useState("");
  const [locationNote, setLocationNote] = useState("");
  const [environmentNote, setEnvironmentNote] = useState("");
  const [equipmentNote, setEquipmentNote] = useState("");
  const [result, setResult] = useState<SifHecaScopeAnalysisResponse | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const canAnalyze = title.trim().length > 2 && (jobDescription.trim() || workScope.trim());

  const energyTypes = useMemo(
    () => result?.analysis.energy_types ?? [],
    [result],
  );

  const orchestrator = useMemo(
    () =>
      result ? buildSifHecaOrchestratorFromAnalysis(result, title.trim() || "Assessment") : null,
    [result, title],
  );

  async function runAnalyze() {
    if (!canAnalyze) return;
    setError(null);
    setAnalyzing(true);
    try {
      const res = await analyzeSifHecaScope({
        companyId,
        projectId,
        title: title.trim(),
        jobDescription: jobDescription.trim() || undefined,
        workScope: workScope.trim() || undefined,
        locationNote: locationNote.trim() || undefined,
        environmentNote: environmentNote.trim() || undefined,
        equipmentNote: equipmentNote.trim() || undefined,
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }

  async function runScore() {
    if (!result) return;
    setError(null);
    setSaving(true);
    try {
      const { analysis } = result;
      const event = await scoreSifHeca({
        companyId,
        projectId,
        sourceType: "general",
        sourceId: `eval-${Date.now()}`,
        title: title.trim() || "Field assessment",
        description: [jobDescription, workScope, locationNote].filter(Boolean).join(" — "),
        hazardSeverity: analysis.max_severity,
        hazardLikelihood: analysis.max_likelihood,
        energyTypes: analysis.energy_types,
        controls: analysis.inferred_controls.map((c) => ({
          controlType: c.control_type,
          adequate: true,
          effectivenessScore: 4,
        })),
      });
      router.push(`/pm/sif-heca/${event.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scoring failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <VeraPageLayout
      title="SIF / HECA evaluation"
      description="CSRA methodology: identify high-energy sources, evaluate exposure & proximity, classify Direct vs Alternative controls, assess SIF potential, recommend missing controls, and produce a HECA assessment document."
    >
      <SfCard className="space-y-4 p-5">
        <div>
          <h2 className="font-medium">1. Work activity & scope</h2>
          <p className="mt-1 text-xs text-[var(--sf-text-muted)]">
            Provide enough detail for the engine to infer hazards, energy types, and whether SIF
            protocol or HECA applies. Include task steps, equipment, and environment where relevant.
          </p>
        </div>
        <SfInput
          placeholder="Activity / job title (required)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <SfFloatingTextarea
          label="Job description — what work is being performed?"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={3}
        />
        <SfFloatingTextarea
          label="Work scope & steps — break down the job (one step per line or numbered)"
          value={workScope}
          onChange={(e) => setWorkScope(e.target.value)}
          rows={4}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <SfInput
            placeholder="Location / work area"
            value={locationNote}
            onChange={(e) => setLocationNote(e.target.value)}
          />
          <SfInput
            placeholder="Environment (weather, ground, congestion…)"
            value={environmentNote}
            onChange={(e) => setEnvironmentNote(e.target.value)}
          />
        </div>
        <SfInput
          placeholder="Equipment, tools, and materials involved"
          value={equipmentNote}
          onChange={(e) => setEquipmentNote(e.target.value)}
        />
        <SfButton
          type="button"
          onClick={() => void runAnalyze()}
          disabled={!canAnalyze || analyzing}
        >
          {analyzing ? "Analyzing scope…" : "Analyze scope with AI"}
        </SfButton>
        {!canAnalyze ? (
          <p className="text-xs text-[var(--sf-text-muted)]">
            Enter an activity title and either a job description or work scope to run analysis.
          </p>
        ) : null}
      </SfCard>

      {orchestrator ? <VeraOrchestratorPanel data={orchestrator} /> : null}

      {result ? (
        <>
          <SfCard className="space-y-3 border-indigo-200 bg-indigo-50/40 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-medium text-indigo-950">Scope fit — SIF & HECA</h2>
              <span className="text-xs text-indigo-700">
                Engine: {result.analysis.engine.join(", ")}
              </span>
            </div>
            <p className="text-sm text-indigo-950">{result.analysis.scope_fit_summary}</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-indigo-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-800">
                  SIF protocol
                </p>
                <p className="mt-2 text-sm">
                  {result.analysis.sif_protocol.applies ? (
                    <span className="font-medium text-orange-800">Applies — elevated review</span>
                  ) : (
                    <span className="font-medium text-green-800">Routine profile</span>
                  )}
                </p>
                <span
                  className={`mt-2 inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${categoryBadgeClass(result.analysis.sif_protocol.category)}`}
                >
                  {result.analysis.sif_protocol.category}
                </span>
                <p className="mt-2 text-xs text-[var(--sf-text-muted)]">
                  {result.analysis.sif_protocol.narrative}
                </p>
                {result.analysis.sif_protocol.indicators.length > 0 ? (
                  <ul className="mt-2 list-disc pl-4 text-xs">
                    {result.analysis.sif_protocol.indicators.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <div className="rounded-lg border border-teal-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">
                  HECA assessment
                </p>
                <p className="mt-2 text-sm font-medium text-teal-950">
                  {result.analysis.heca_assessment.primary_label}
                </p>
                {result.analysis.heca_assessment.high_energy ? (
                  <span className="mt-1 inline-block rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                    High energy
                  </span>
                ) : null}
                <p className="mt-2 text-xs text-[var(--sf-text-muted)]">
                  {result.analysis.heca_assessment.narrative}
                </p>
                {result.analysis.heca_assessment.secondary_categories.length > 0 ? (
                  <p className="mt-1 text-xs text-teal-800">
                    Also consider:{" "}
                    {result.analysis.heca_assessment.secondary_categories.join(", ")}
                  </p>
                ) : null}
              </div>
            </div>
          </SfCard>

          {result.analysis.job_steps.length > 0 ? (
            <SfCard className="space-y-2 p-5">
              <h2 className="font-medium">Inferred job steps</h2>
              <ol className="list-decimal space-y-1 pl-5 text-sm">
                {result.analysis.job_steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </SfCard>
          ) : null}

          <SfCard className="space-y-3 p-5">
            <h2 className="font-medium">2. AI-inferred hazards</h2>
            {result.analysis.inferred_hazards.length === 0 ? (
              <p className="text-sm text-[var(--sf-text-muted)]">
                No hazards inferred — add more scope detail and re-run analysis.
              </p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-[var(--sf-border)]">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--sf-surface-muted)] text-left text-xs uppercase tracking-wide text-[var(--sf-text-muted)]">
                    <tr>
                      <th className="px-3 py-2">Hazard</th>
                      <th className="px-3 py-2">Category</th>
                      <th className="px-3 py-2 text-right">S×L</th>
                      <th className="px-3 py-2">Energy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--sf-border)]">
                    {result.analysis.inferred_hazards.map((h) => (
                      <tr key={h.description}>
                        <td className="px-3 py-2">
                          <p>{h.description}</p>
                          <p className="text-xs text-[var(--sf-text-muted)]">{h.reason}</p>
                        </td>
                        <td className="px-3 py-2 text-xs">{h.category}</td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {h.severity}×{h.likelihood}
                        </td>
                        <td className="px-3 py-2 text-xs">
                          {h.energy_types.join(", ") || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SfCard>

          <SfCard className="space-y-3 p-5">
            <h2 className="font-medium">3. AI-inferred controls</h2>
            {result.analysis.inferred_controls.length === 0 ? (
              <p className="text-sm text-[var(--sf-text-muted)]">No controls inferred yet.</p>
            ) : (
              <ul className="divide-y rounded-lg border border-[var(--sf-border)]">
                {result.analysis.inferred_controls.map((c) => (
                  <li key={c.description} className="px-3 py-2.5 text-sm">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium uppercase">
                      {c.control_type}
                    </span>
                    <span className="ml-2">{c.description}</span>
                    <p className="text-xs text-[var(--sf-text-muted)]">
                      For: {c.linked_hazard} — {c.reason}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </SfCard>

          <SfCard className="p-5">
            <JhaEnergyWheelPanel
              hazards={result.analysis.inferred_hazards.map((h, i) => ({
                id: String(i),
                description: h.description,
                energyTypes: h.energy_types,
              }))}
              controls={result.analysis.inferred_controls.map((c, i) => ({
                id: String(i),
                description: c.description,
                controlType: c.control_type,
              }))}
              controlLibrary={result.analysis.inferred_controls.map((c) => ({
                description: c.description,
                controlType: c.control_type,
                energyTypes: [],
              }))}
              value={energyTypes}
              onChange={() => undefined}
              disabled
              compact
            />
          </SfCard>

          <SfCard className="space-y-3 p-5">
            <h2 className="font-medium">4. Deterministic SIF / HECA score</h2>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-lg border px-4 py-3">
                <p className="text-xs uppercase text-[var(--sf-text-muted)]">SIF score</p>
                <p className="text-2xl font-semibold">{result.evaluation.sif_score}</p>
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs font-semibold uppercase ${categoryBadgeClass(result.evaluation.sif_category)}`}
                >
                  {result.evaluation.sif_category}
                </span>
              </div>
              <div className="rounded-lg border px-4 py-3">
                <p className="text-xs uppercase text-[var(--sf-text-muted)]">HECA</p>
                <p className="text-lg font-semibold">{result.evaluation.heca_category_label}</p>
                <p className="text-xs text-[var(--sf-text-muted)]">
                  Risk {result.evaluation.heca_risk_score ?? "—"} · High energy{" "}
                  {result.evaluation.high_energy_flag ? "YES" : "no"}
                </p>
              </div>
            </div>
            {result.evaluation.requires_supervisor_review ? (
              <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                Supervisor review required before work proceeds.
              </p>
            ) : null}
            {result.evaluation.required_controls.length > 0 ? (
              <div>
                <p className="text-xs font-semibold uppercase text-[var(--sf-text-muted)]">
                  Required controls
                </p>
                <ul className="mt-1 list-disc pl-5 text-sm">
                  {result.evaluation.required_controls.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {result.analysis.warnings.length > 0 ? (
              <ul className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                {result.analysis.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            ) : null}
          </SfCard>

          {(result.csra ?? result.evaluation.csra) ? (
            <HecaCsraDocumentPanel
              csra={(result.csra ?? result.evaluation.csra)!}
            />
          ) : null}
        </>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        {result ? (
          <>
            <SfButton type="button" variant="secondary" onClick={() => void runAnalyze()} disabled={analyzing}>
              Re-analyze
            </SfButton>
            <SfButton type="button" onClick={() => void runScore()} disabled={saving}>
              {saving ? "Saving…" : "Create SIF / HECA record"}
            </SfButton>
          </>
        ) : null}
      </div>
    </VeraPageLayout>
  );
}
