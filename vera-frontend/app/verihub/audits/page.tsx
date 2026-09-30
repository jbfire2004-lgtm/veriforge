"use client";

import { VeriHubConsoleShell } from "@/src/components/verihub/VeriHubConsoleShell";
import {
  AuditList,
  TemplateBuilderPanel,
} from "@/src/components/audit-evaluation";
import { CorrectiveActionTracker } from "@/src/components/audit-evaluation";
import { useEffect, useState } from "react";
import { listCorrectiveActions, type CorrectiveAction } from "@/lib/audit-evaluation-api";
import { getVeriHubSession } from "@/lib/verihub-org-api";

export default function VeriHubAuditsPage() {
  const session = getVeriHubSession();
  const orgId = session?.orgId;
  const [cas, setCas] = useState<CorrectiveAction[]>([]);

  useEffect(() => {
    if (!orgId) return;
    void listCorrectiveActions(orgId)
      .then((d) => setCas(d.items))
      .catch(() => setCas([]));
  }, [orgId]);

  return (
    <VeriHubConsoleShell
      title="Audits & evaluation"
      description="Templates, weighted scoring, reviewer assignment, and corrective actions. Scores sync to Contractor Directory compliance."
    >
      {!orgId ? (
        <p className="text-sm text-zinc-600">Sign in to manage audits.</p>
      ) : (
        <div className="space-y-10">
          <AuditList contractorId={orgId} />
          <TemplateBuilderPanel />
          <section className="space-y-3">
            <h3 className="text-sm font-medium uppercase text-zinc-500">
              Corrective action tracker
            </h3>
            <CorrectiveActionTracker
              actions={cas}
              onChanged={() =>
                void listCorrectiveActions(orgId).then((d) => setCas(d.items))
              }
            />
          </section>
        </div>
      )}
    </VeriHubConsoleShell>
  );
}
