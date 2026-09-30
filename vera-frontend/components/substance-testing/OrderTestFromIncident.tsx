"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  listTestsByIncident,
  orderTestFromIncident,
  TEST_TYPE_LABELS,
  OUTCOME_LABELS,
  OUTCOME_COLORS,
} from "@/lib/pm-substance-testing";
import { Button } from "@/components/ui/button";
import { WorkspaceSection } from "@/components/theme/workspace";

type Props = {
  incidentId: string;
  workerId: number;
  projectId?: number;
};

export function OrderTestFromIncident({ incidentId, workerId, projectId = 1 }: Props) {
  const [tests, setTests] = useState<Array<{ id: string; status: string; result?: { outcome: string } }>>([]);
  const [busy, setBusy] = useState(false);

  function load() {
    void listTestsByIncident(incidentId).then(setTests);
  }

  useEffect(() => {
    load();
  }, [incidentId]);

  async function order() {
    setBusy(true);
    try {
      await orderTestFromIncident(incidentId, { workerId });
      load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <WorkspaceSection
      title="Drug & alcohol testing"
      description="Post-incident testing linked to this investigation"
    >
      {tests.length ? (
        <ul className="mb-3 space-y-2">
          {tests.map((t) => (
            <li key={t.id}>
              <Link
                href={`/pm/substance-testing/${t.id}?projectId=${projectId}`}
                className="text-sm text-[#2F8F8C] hover:underline"
              >
                Post-incident test — {t.status.replace(/_/g, " ")}
                {t.result ? (
                  <span
                    className={`ml-2 rounded px-1.5 text-xs ${OUTCOME_COLORS[t.result.outcome as keyof typeof OUTCOME_COLORS] ?? ""}`}
                  >
                    {OUTCOME_LABELS[t.result.outcome as keyof typeof OUTCOME_LABELS] ?? t.result.outcome}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void order()}>
        {busy ? "Ordering…" : `Order ${TEST_TYPE_LABELS.post_incident} test`}
      </Button>
    </WorkspaceSection>
  );
}
