"use client";

import Link from "next/link";
import type { ScoreEvidence } from "@/lib/contractor-safety-score/types";
import { Button } from "@/components/ui/button";
import { PILLAR_LABELS, type PillarId } from "@/lib/contractor-safety-score/types";

export function ContractorScoreEvidenceSheet({
  open,
  title,
  formula,
  formulaId,
  inputs,
  evidence,
  pillarFilter,
  onPillarFilter,
  onClose,
  loading,
}: {
  open: boolean;
  title: string;
  formula?: string;
  formulaId?: string;
  inputs?: Record<string, number | null>;
  evidence: ScoreEvidence[];
  pillarFilter?: PillarId | "";
  onPillarFilter?: (p: PillarId | "") => void;
  onClose: () => void;
  loading?: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" role="dialog" aria-modal>
      <button type="button" className="flex-1" aria-label="Close" onClick={onClose} />
      <aside className="flex h-full w-full max-w-xl flex-col border-l border-[#5A6169]/40 bg-white">
        <header className="flex items-start justify-between gap-3 border-b border-[#5A6169]/30 px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2F8F8C]">
              Score evidence
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[#2A2E33]">{title}</h2>
            {formulaId ? (
              <p className="mt-1 font-mono text-xs text-[#5a6b7c]">{formulaId}</p>
            ) : null}
          </div>
          <Button type="button" size="sm" variant="outline" onClick={onClose}>
            Close
          </Button>
        </header>

        <div className="space-y-3 border-b border-[#5A6169]/30 bg-[#F7FAFC] px-5 py-4">
          {formula ? (
            <p className="rounded-[3px] border border-[#5A6169]/40 bg-white px-3 py-2 font-mono text-sm text-[#2A2E33]">
              {formula}
            </p>
          ) : null}
          {inputs ? (
            <div className="flex flex-wrap gap-2">
              {Object.entries(inputs).map(([k, v]) => (
                <span
                  key={k}
                  className="rounded-[3px] border border-[#5A6169]/40 bg-white px-2 py-1 text-xs"
                >
                  {k}: <strong className="tabular-nums">{v ?? "—"}</strong>
                </span>
              ))}
            </div>
          ) : null}
          {onPillarFilter ? (
            <select
              className="h-9 rounded-[3px] border border-[#5A6169] bg-white px-2 text-sm"
              value={pillarFilter ?? ""}
              onChange={(e) => onPillarFilter(e.target.value as PillarId | "")}
            >
              <option value="">All pillars</option>
              {(Object.keys(PILLAR_LABELS) as PillarId[]).map((id) => (
                <option key={id} value={id}>
                  {PILLAR_LABELS[id]}
                </option>
              ))}
            </select>
          ) : null}
        </div>

        <div className="flex-1 overflow-auto px-5 py-4">
          {loading ? (
            <p className="text-sm text-[#5a6b7c]">Loading evidence…</p>
          ) : (
            <ul className="divide-y divide-[#5A6169]/25 rounded-[3px] border border-[#5A6169]/30">
              {evidence.map((e) => (
                <li key={e.id} className="px-3 py-3 hover:bg-[#F7FAFC]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[#2A2E33]">{e.title}</p>
                      <p className="mt-0.5 text-xs text-[#5a6b7c]">
                        {PILLAR_LABELS[e.pillar]} · {e.evidenceType}
                        {e.subtitle ? ` · ${e.subtitle}` : ""}
                      </p>
                      {e.weightContribution != null ? (
                        <p className="mt-1 text-xs tabular-nums text-[#8A9199]">
                          Contribution {e.weightContribution > 0 ? "+" : ""}
                          {e.weightContribution}
                        </p>
                      ) : null}
                    </div>
                    {e.href ? (
                      <Link href={e.href} className="text-xs font-semibold text-[#1E6FB8] hover:underline">
                        Open
                      </Link>
                    ) : null}
                  </div>
                </li>
              ))}
              {evidence.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-[#5a6b7c]">No evidence rows.</li>
              ) : null}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
