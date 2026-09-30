"use client";

import { useEffect, useState } from "react";
import { HiringClientShell } from "@/src/components/client/HiringClientShell";
import {
  AwardContractButton,
  ContractorCard,
  ContractorComplianceView,
  ContractorScorecardView,
} from "@/src/components/client";
import {
  canAward,
  getContractorCompliance,
  getContractorScorecard,
  getHiringClientSession,
} from "@/lib/hiring-client-api";
import { useContractors } from "@/lib/veriforge-hooks";

export default function ClientReviewPage() {
  const { data: contractors, error, loading } = useContractors();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scorecard, setScorecard] = useState<Awaited<
    ReturnType<typeof getContractorScorecard>
  > | null>(null);
  const [compliance, setCompliance] = useState<Awaited<
    ReturnType<typeof getContractorCompliance>
  > | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [allowAward, setAllowAward] = useState(false);

  useEffect(() => {
    setAllowAward(canAward(getHiringClientSession()));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setMsg(null);
    getContractorScorecard(selectedId)
      .then(setScorecard)
      .catch((err: Error) => setMsg(err.message));
    getContractorCompliance(selectedId)
      .then(setCompliance)
      .catch((err: Error) => setMsg(err.message));
  }, [selectedId]);

  return (
    <HiringClientShell
      title="Contractor review"
      description="Review scorecards and compliance before awarding work."
    >
      {error || msg ? (
        <p className="mb-4 text-sm text-red-600">{error ?? msg}</p>
      ) : null}
      {loading ? (
        <p className="text-sm text-zinc-500">Loading contractors…</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <ul className="space-y-3">
            {(contractors ?? []).map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => setSelectedId(c.id)}
                >
                  <ContractorCard contractor={c} />
                </button>
              </li>
            ))}
          </ul>
          <div className="space-y-6">
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase text-zinc-600">
                  Scorecard
                </h2>
                {selectedId && allowAward ? (
                  <AwardContractButton
                    contractorId={selectedId}
                    onAwarded={setMsg}
                  />
                ) : null}
              </div>
              <ContractorScorecardView scorecard={scorecard} />
            </section>
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase text-zinc-600">
                Compliance
              </h2>
              <ContractorComplianceView compliance={compliance} />
            </section>
          </div>
        </div>
      )}
    </HiringClientShell>
  );
}
