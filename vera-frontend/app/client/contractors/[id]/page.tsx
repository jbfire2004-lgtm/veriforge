"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { HiringClientShell } from "@/src/components/client/HiringClientShell";
import {
  AwardContractButton,
  ContractorComplianceView,
  ContractorScorecardView,
} from "@/src/components/client";
import {
  canAward,
  getContractorCompliance,
  getContractorScorecard,
  getHiringClientSession,
  listContractors,
} from "@/lib/hiring-client-api";

export default function ClientContractorDetailPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const [name, setName] = useState<string>("Contractor");
  const [scorecard, setScorecard] = useState<Awaited<
    ReturnType<typeof getContractorScorecard>
  > | null>(null);
  const [compliance, setCompliance] = useState<Awaited<
    ReturnType<typeof getContractorCompliance>
  > | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allowAward, setAllowAward] = useState(false);

  useEffect(() => {
    setAllowAward(canAward(getHiringClientSession()));
    if (!id) return;
    listContractors()
      .then((data) => {
        const row = (data.items ?? []).find((c) => c.id === id);
        if (row) setName(row.companyName);
      })
      .catch(() => undefined);
    getContractorScorecard(id)
      .then(setScorecard)
      .catch((err: Error) => setError(err.message));
    getContractorCompliance(id)
      .then(setCompliance)
      .catch((err: Error) => setError(err.message));
  }, [id]);

  return (
    <HiringClientShell
      title={name}
      description="Contractor scorecard and compliance detail."
      actions={
        allowAward ? (
          <AwardContractButton contractorId={id} onAwarded={setError} />
        ) : null
      }
    >
      <p className="mb-4 text-sm">
        <Link className="underline" href="/client/review">
          ← Back to review
        </Link>
      </p>
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      <div className="space-y-8">
        <ContractorScorecardView scorecard={scorecard} />
        <ContractorComplianceView compliance={compliance} />
      </div>
    </HiringClientShell>
  );
}
