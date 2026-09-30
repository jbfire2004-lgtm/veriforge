"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HiringClientShell } from "@/src/components/client/HiringClientShell";
import { ContractorCard } from "@/src/components/client";
import { useContractors } from "@/lib/veriforge-hooks";

export default function ClientContractorsPage() {
  const { data: items, error, loading } = useContractors();
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  return (
    <HiringClientShell
      title="Contractors"
      description="Organizations available for review and award."
    >
      <p className="mb-4 text-sm">
        <Link className="underline" href="/client/review">
          Open contractor review
        </Link>
      </p>
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      {!ready || loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {(items ?? []).map((c) => (
            <li key={c.id}>
              <ContractorCard contractor={c} />
            </li>
          ))}
          {!items?.length ? (
            <li className="text-sm text-zinc-500">No contractors yet.</li>
          ) : null}
        </ul>
      )}
    </HiringClientShell>
  );
}
