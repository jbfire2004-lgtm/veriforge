"use client";

import { VeriHubConsoleShell } from "@/src/components/verihub/VeriHubConsoleShell";
import { InstantQuickCheckPanel } from "@/src/components/quickcheck";
import { getVeriHubSession } from "@/lib/verihub-org-api";

export default function VeriHubQuickCheckPage() {
  const session = getVeriHubSession();
  const orgId = session?.orgId;

  return (
    <VeriHubConsoleShell
      title="QuickCheck"
      description="Instant compliance score, missing items, and green / yellow / red risk — from Document Center, Audits, PVS, and Insurance. Each run is logged."
    >
      {!orgId ? (
        <p className="text-sm text-zinc-600">Sign in to run QuickCheck.</p>
      ) : (
        <InstantQuickCheckPanel contractorId={orgId} source="page" autoRun />
      )}
    </VeriHubConsoleShell>
  );
}
