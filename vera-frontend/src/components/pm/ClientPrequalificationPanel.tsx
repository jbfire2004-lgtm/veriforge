"use client";

import { useState } from "react";
import { ClipboardCopy, FileCheck2 } from "lucide-react";
import {
  evaluateClientPrequalificationMembership,
  type ClientPrequalificationResult,
} from "@/lib/client-prequalification-ai";
import { Button } from "@/components/ui/button";

const STATUS_STYLES: Record<string, string> = {
  Approved: "bg-emerald-100 text-emerald-900",
  Conditional: "bg-amber-100 text-amber-900",
  Rejected: "bg-red-100 text-red-900",
};

function DimensionBar({ label, score }: { label: string; score: number }) {
  const tone =
    score >= 75 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-slate-600">
        <span>{label}</span>
        <span className="font-semibold">{score}/100</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full ${tone}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export function ClientPrequalificationPanel({
  membershipId,
  contractorName,
}: {
  membershipId: string;
  contractorName: string;
}) {
  const [result, setResult] = useState<ClientPrequalificationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const out = await evaluateClientPrequalificationMembership(membershipId);
      setResult(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Prequalification failed");
    } finally {
      setBusy(false);
    }
  }

  async function copyReport() {
    if (!result?.report.markdown) return;
    await navigator.clipboard.writeText(result.report.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-2 space-y-3 rounded-lg border border-indigo-100 bg-indigo-50/40 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <FileCheck2 className="h-4 w-4 text-indigo-800" />
        <span className="text-sm font-medium text-indigo-950">Client prequalification</span>
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => void run()}>
          {busy ? "Evaluating…" : "Run prequalification"}
        </Button>
        {error ? <span className="text-xs text-red-600">{error}</span> : null}
      </div>

      {result ? (
        <div className="space-y-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[result.final_status] ?? "bg-slate-100"}`}
            >
              {result.final_status}
            </span>
            <span className="text-xs font-semibold text-slate-700">
              Score {result.company_score}/100
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              onClick={() => void copyReport()}
            >
              <ClipboardCopy className="h-3 w-3" />
              {copied ? "Copied" : "Copy report"}
            </Button>
          </div>

          <p className="text-xs text-slate-600">{result.report.executive_summary}</p>

          <div className="grid gap-2 sm:grid-cols-2">
            <DimensionBar label="HSE metrics" score={result.dimension_scores.hse_metrics} />
            <DimensionBar label="Insurance" score={result.dimension_scores.insurance} />
            <DimensionBar label="WCB / WSIB" score={result.dimension_scores.wcb_wsib} />
            <DimensionBar label="Safety program" score={result.dimension_scores.safety_program} />
          </div>

          {result.missing_items.length > 0 ? (
            <div>
              <p className="text-xs font-semibold text-slate-700">Missing items</p>
              <ul className="mt-1 list-disc pl-4 text-xs text-slate-600">
                {result.missing_items.slice(0, 5).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.risk_flags.length > 0 ? (
            <div>
              <p className="text-xs font-semibold text-red-800">Risk flags</p>
              <ul className="mt-1 list-disc pl-4 text-xs text-red-700">
                {result.risk_flags.slice(0, 4).map((flag) => (
                  <li key={flag}>{flag}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="text-xs text-slate-500">
            Shareable report for {contractorName} · ID {result.report.report_id.slice(0, 8)}
          </p>
        </div>
      ) : null}
    </div>
  );
}
