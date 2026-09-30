"use client";

import { useState } from "react";
import {
  verifyContractorMembership,
  type ContractorVerificationResult,
} from "@/lib/contractor-verification-ai";
import { Button } from "@/components/ui/button";

const STATUS_STYLES: Record<string, string> = {
  Approved: "bg-emerald-100 text-emerald-900",
  "Conditionally Approved": "bg-amber-100 text-amber-900",
  Rejected: "bg-red-100 text-red-900",
};

function ScoreBar({ label, score }: { label: string; score: number }) {
  const tone =
    score >= 75 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-slate-600">
        <span>{label}</span>
        <span className="font-semibold">{score}/100</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full ${tone}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export function ContractorVerificationPanel({
  membershipId,
  contractorName,
}: {
  membershipId: string;
  contractorName: string;
}) {
  const [result, setResult] = useState<ContractorVerificationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const out = await verifyContractorMembership(membershipId);
      setResult(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2 space-y-3 rounded-lg border border-teal-100 bg-teal-50/50 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => void run()}>
          {busy ? "Analyzing…" : "Run AI verification"}
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
            <span className="text-xs text-slate-500">ID {result.verification_id.slice(0, 8)}</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <ScoreBar label="Document authenticity" score={result.authenticity_score} />
            <ScoreBar label="Compliance score" score={result.compliance_score} />
          </div>

          <p className="text-xs text-slate-700">{result.pm_summary}</p>

          {result.risk_flags.length > 0 ? (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-slate-500">Risk flags</p>
              <ul className="list-inside list-disc text-xs text-slate-700">
                {result.risk_flags.slice(0, 5).map((flag) => (
                  <li key={flag}>{flag}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.missing_items.length > 0 ? (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-slate-500">Missing items</p>
              <ul className="list-inside list-disc text-xs text-slate-700">
                {result.missing_items.slice(0, 5).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.recommended_actions.length > 0 ? (
            <details className="text-xs text-slate-600">
              <summary className="cursor-pointer font-medium text-slate-800">
                Verifier guidance for {contractorName}
              </summary>
              <ul className="mt-1 list-inside list-disc">
                {result.verifier_guidance.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
