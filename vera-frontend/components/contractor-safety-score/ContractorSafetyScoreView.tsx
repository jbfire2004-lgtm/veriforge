"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  emitContractorScoreEvent,
  fetchContractorScore,
  fetchScoreEvidence,
  fetchScoreHistory,
  listContractorScores,
  recalculateContractorScore,
} from "@/lib/contractor-safety-score";
import type {
  ContractorSafetyScoreDto,
  PillarId,
  ScoreEvidence,
  ScoreHistoryPoint,
} from "@/lib/contractor-safety-score/types";
import { PILLAR_LABELS } from "@/lib/contractor-safety-score/types";
import { ContractorScoreBadge } from "@/components/contractor-safety-score/ContractorScoreBadge";
import { ContractorScoreEvidenceSheet } from "@/components/contractor-safety-score/ContractorScoreEvidenceSheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  initialContractorId?: number | null;
};

export function ContractorSafetyScoreView({ initialContractorId = null }: Props) {
  const [list, setList] = useState<ContractorSafetyScoreDto[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(initialContractorId);
  const [score, setScore] = useState<ContractorSafetyScoreDto | null>(null);
  const [history, setHistory] = useState<ScoreHistoryPoint[]>([]);
  const [evidence, setEvidence] = useState<ScoreEvidence[]>([]);
  const [pillarFilter, setPillarFilter] = useState<PillarId | "">("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetTitle, setSheetTitle] = useState("Evidence");
  const [sheetFormula, setSheetFormula] = useState<string | undefined>();
  const [sheetFormulaId, setSheetFormulaId] = useState<string | undefined>();
  const [sheetInputs, setSheetInputs] = useState<Record<string, number | null> | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    const data = await listContractorScores();
    setList(data.items);
    if (!selectedId && data.items[0]) {
      setSelectedId(data.items[0].contractorCompanyId);
    }
  }, [selectedId]);

  const loadDetail = useCallback(async (id: number) => {
    const [sc, hist, ev] = await Promise.all([
      fetchContractorScore(id),
      fetchScoreHistory(id),
      fetchScoreEvidence(id, pillarFilter || undefined),
    ]);
    setScore(sc);
    setHistory(hist.items);
    setEvidence(ev.items);
  }, [pillarFilter]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    void loadList()
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load scores"))
      .finally(() => setLoading(false));
  }, [loadList]);

  useEffect(() => {
    if (!selectedId) return;
    void loadDetail(selectedId).catch((e) =>
      setError(e instanceof Error ? e.message : "Failed to load score detail"),
    );
  }, [selectedId, loadDetail]);

  const filteredEvidence = useMemo(() => {
    if (!pillarFilter) return evidence;
    return evidence.filter((e) => e.pillar === pillarFilter);
  }, [evidence, pillarFilter]);

  function openOverallEvidence() {
    if (!score) return;
    setSheetTitle(`${score.contractorName} — all evidence`);
    setSheetFormula("overallScore = Σ (pillarScore × weight)");
    setSheetFormulaId("css.overall.v1");
    setSheetInputs(
      Object.fromEntries(
        Object.values(score.pillars).map((p) => [p.id, p.weightedContribution]),
      ),
    );
    setPillarFilter("");
    setSheetOpen(true);
  }

  function openPillar(pillarId: PillarId) {
    if (!score) return;
    const p = score.pillars[pillarId];
    setSheetTitle(p.label);
    setSheetFormula(p.formula);
    setSheetFormulaId(p.formulaId);
    setSheetInputs(p.inputs);
    setPillarFilter(pillarId);
    setSheetOpen(true);
  }

  async function onSimulate(eventName: string) {
    if (!selectedId) return;
    const sc = await emitContractorScoreEvent(selectedId, eventName);
    setScore(sc);
    await loadList();
    await loadDetail(selectedId);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-[#5A6169]/25 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2F8F8C]">
            Contractor Safety Score · ISNetworld-style
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#2A2E33]">
            Program assessment scores
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[#5a6b7c]">
            Explainable 0–100 scores from policies, training, incidents, CAPA, audits, and toolbox
            talks — with drill-down evidence and event-driven recalculation.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!selectedId}
            onClick={() =>
              selectedId &&
              void recalculateContractorScore(selectedId).then(async (sc) => {
                setScore(sc);
                await loadList();
                await loadDetail(selectedId);
              })
            }
          >
            Recalculate
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!selectedId}
            onClick={() => void onSimulate("training.completed")}
          >
            Simulate training
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!selectedId}
            onClick={() => void onSimulate("incident.near_miss")}
          >
            Simulate incident
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!selectedId}
            onClick={() => void onSimulate("policy.document.approved")}
          >
            Simulate policy fix
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-[3px] border border-[#C89F3D]/50 bg-[#FBF8F0] px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      {loading && list.length === 0 ? <Skeleton className="h-32 w-full rounded-[3px]" /> : null}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-[3px] border border-[#5A6169]/40 bg-white">
          <p className="border-b border-[#5A6169]/30 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5a6b7c]">
            Hired contractors
          </p>
          <ul>
            {list.map((c) => (
              <li key={c.contractorCompanyId}>
                <button
                  type="button"
                  onClick={() => setSelectedId(c.contractorCompanyId)}
                  className={`flex w-full items-center justify-between gap-2 border-b border-[#5A6169]/20 px-3 py-3 text-left text-sm hover:bg-[#F7FAFC] ${
                    selectedId === c.contractorCompanyId
                      ? "bg-[rgba(30,111,184,0.08)] shadow-[inset_3px_0_0_#1E6FB8]"
                      : ""
                  }`}
                >
                  <span className="font-medium text-[#2A2E33]">{c.contractorName}</span>
                  <ContractorScoreBadge
                    overallScore={c.overallScore}
                    grade={c.grade}
                    status={c.status}
                    size="sm"
                  />
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="space-y-5">
          {!score ? (
            <p className="text-sm text-[#5a6b7c]">Select a contractor.</p>
          ) : (
            <>
              <div className="rounded-[3px] border border-[#5A6169]/40 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-[#2A2E33]">
                      {score.contractorName}
                    </h2>
                    <p className="mt-1 text-xs text-[#5a6b7c]">
                      Scored {new Date(score.scoredAt).toLocaleString()} · rev {score.revision} ·{" "}
                      {score.status}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {score.dataSources.map((d) => (
                        <span
                          key={d.id}
                          className="rounded-[3px] border border-[#5A6169]/40 px-2 py-0.5 text-[11px] text-[#5a6b7c]"
                        >
                          {d.label}
                          {d.count != null ? ` (${d.count})` : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <ContractorScoreBadge
                      overallScore={score.overallScore}
                      grade={score.grade}
                      status={score.status}
                      size="lg"
                      onClick={openOverallEvidence}
                    />
                    <Button type="button" size="sm" variant="outline" onClick={openOverallEvidence}>
                      View evidence
                    </Button>
                  </div>
                </div>

                {score.gatesTriggered.length > 0 ? (
                  <ul className="mt-4 space-y-1 rounded-[3px] border border-[#C89F3D]/40 bg-[#FBF8F0] px-3 py-2 text-xs text-[#2A2E33]">
                    {score.gatesTriggered.map((g) => (
                      <li key={g.code}>
                        <strong>{g.label}</strong> — {g.effect}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {history.length > 1 ? (
                  <div className="mt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5a6b7c]">
                      Trend
                    </p>
                    <div className="mt-2 flex h-16 items-end gap-1">
                      {history.slice(-12).map((h) => (
                        <div
                          key={h.id}
                          title={`${h.overallScore} (${h.grade}) · ${h.triggerEvent ?? ""}`}
                          className="flex-1 rounded-t-[2px] bg-[#1E6FB8]/80"
                          style={{ height: `${Math.max(8, h.overallScore)}%` }}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#2A2E33]">
                  Subscores
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {(Object.keys(score.pillars) as PillarId[]).map((id) => {
                    const p = score.pillars[id];
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => openPillar(id)}
                        className="rounded-[3px] border border-[#5A6169]/40 bg-white p-4 text-left hover:border-[#1E6FB8]"
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5a6b7c]">
                          {PILLAR_LABELS[id]}
                        </p>
                        <p className="mt-2 text-3xl font-bold tabular-nums text-[#2A2E33]">
                          {p.score}
                        </p>
                        <p className="mt-1 text-xs text-[#8A9199]">
                          Weight {(p.weight * 100).toFixed(0)}% · contrib {p.weightedContribution}
                        </p>
                        <p className="mt-2 font-mono text-[11px] text-[#5a6b7c]">{p.formula}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      <ContractorScoreEvidenceSheet
        open={sheetOpen}
        title={sheetTitle}
        formula={sheetFormula}
        formulaId={sheetFormulaId}
        inputs={sheetInputs}
        evidence={filteredEvidence}
        pillarFilter={pillarFilter}
        onPillarFilter={(p) => {
          setPillarFilter(p);
          if (selectedId) {
            void fetchScoreEvidence(selectedId, p || undefined).then((ev) =>
              setEvidence(ev.items),
            );
          }
        }}
        onClose={() => setSheetOpen(false)}
      />
    </div>
  );
}
