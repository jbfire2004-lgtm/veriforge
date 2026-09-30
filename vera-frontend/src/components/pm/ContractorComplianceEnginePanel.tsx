"use client";

import { useState } from "react";
import {
  generateContractorComplianceForMembership,
  type ContractorComplianceEngineOutput,
} from "@/lib/pm-contractor-portal";
import { Button } from "@/components/ui/button";

const STATUS_STYLES: Record<string, string> = {
  approve: "bg-emerald-100 text-emerald-900",
  conditional: "bg-amber-100 text-amber-900",
  reject: "bg-red-100 text-red-900",
};

export function ContractorComplianceEnginePanel({
  membershipId,
  contractorName,
}: {
  membershipId: string;
  contractorName: string;
}) {
  const [output, setOutput] = useState<ContractorComplianceEngineOutput | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const out = await generateContractorComplianceForMembership(membershipId);
      setOutput(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Evaluation failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2 space-y-3 rounded-lg border border-slate-100 bg-slate-50/80 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => void run()}>
          {busy ? "Evaluating…" : "Run compliance engine"}
        </Button>
        {error ? <span className="text-xs text-red-600">{error}</span> : null}
      </div>

      {output ? (
        <div className="space-y-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${STATUS_STYLES[output.approval_status] ?? "bg-slate-100"}`}
            >
              {output.approval_status}
            </span>
            <span className="text-xs text-slate-600">
              Risk {output.risk_profile.inherent_risk_level} ({output.risk_profile.risk_score})
              {output.risk_profile.sif_exposure ? " · SIF exposure" : ""}
            </span>
          </div>

          <p className="text-xs text-slate-700">{output.internal_summary}</p>

          {output.compliance_gaps.length > 0 ? (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-slate-500">Gaps</p>
              <ul className="space-y-1 text-xs text-slate-700">
                {output.compliance_gaps.slice(0, 4).map((g) => (
                  <li key={`${g.requirement}-${g.status}`}>
                    {g.requirement} — {g.status}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <details className="text-xs text-slate-600">
            <summary className="cursor-pointer font-medium text-slate-800">
              Contractor feedback for {contractorName}
            </summary>
            <p className="mt-1">{output.contractor_feedback}</p>
          </details>
        </div>
      ) : null}
    </div>
  );
}
