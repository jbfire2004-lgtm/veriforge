"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  getSubstanceTest,
  TEST_TYPE_LABELS,
  type SubstanceTestEvent,
} from "@/lib/pm-substance-testing";
import { ChainOfCustodyPanel } from "@/components/substance-testing/ChainOfCustodyPanel";
import { ResultRecordingForm } from "@/components/substance-testing/ResultRecordingForm";
import { TestDocumentsPanel } from "@/components/substance-testing/TestDocumentsPanel";
import { WorkspaceSection } from "@/components/theme/workspace";

type Tab = "overview" | "custody" | "result" | "documents";

export default function SubstanceTestDetailPage({
  id,
  projectId = 1,
}: {
  id: string;
  projectId?: number;
}) {
  const [test, setTest] = useState<SubstanceTestEvent | null>(null);
  const [tab, setTab] = useState<Tab>("overview");

  const load = useCallback(() => {
    void getSubstanceTest(id).then(setTest);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!test) {
    return <p className="p-8 text-sm text-[#64748b]">Loading…</p>;
  }

  const workerName = `${test.worker.firstName} ${test.worker.lastName}`;
  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "custody", label: "Chain of custody" },
    { id: "result", label: "Result" },
    { id: "documents", label: "Documents" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold text-[#2A2E33]">{workerName}</h1>
        <p className="text-sm text-[#64748b]">
          {TEST_TYPE_LABELS[test.testType]} · {test.specimenType.replace(/_/g, " ")} ·{" "}
          {test.status.replace(/_/g, " ")}
        </p>
      </header>

      <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-[#2A2E33]/10 bg-white p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium ${
              tab === t.id ? "bg-[#2A2E33] text-white" : "text-[#64748b] hover:bg-[#f1f5f9]"
            }`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "overview" && (
        <div className="space-y-6">
          <WorkspaceSection title="Test details">
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[#64748b]">Scheduled</dt>
                <dd>{test.scheduledAt ? new Date(test.scheduledAt).toLocaleString() : "—"}</dd>
              </div>
              <div>
                <dt className="text-[#64748b]">Collected</dt>
                <dd>{test.collectedAt ? new Date(test.collectedAt).toLocaleString() : "—"}</dd>
              </div>
              {test.collectionSiteNote ? (
                <div className="sm:col-span-2">
                  <dt className="text-[#64748b]">Collection site</dt>
                  <dd>{test.collectionSiteNote}</dd>
                </div>
              ) : null}
            </dl>
          </WorkspaceSection>

          {test.incidentEvent ? (
            <WorkspaceSection title="Linked incident investigation">
              <Link
                href={`/pm/incidents/${test.incidentEvent.id}?projectId=${projectId}`}
                className="text-sm text-[#2F8F8C] hover:underline"
              >
                {test.incidentEvent.title} ({test.incidentEvent.eventType.replace(/_/g, " ")})
              </Link>
            </WorkspaceSection>
          ) : null}

          {test.suspicionNotes ? (
            <WorkspaceSection title="Reasonable suspicion documentation">
              <p className="whitespace-pre-wrap text-sm text-[#5a6b7c]">{test.suspicionNotes}</p>
            </WorkspaceSection>
          ) : null}

          <WorkspaceSection title="Worker profile">
            <Link
              href={`/pm/worker-safety-profile?workerId=${test.workerId}`}
              className="text-sm text-[#2F8F8C] hover:underline"
            >
              View worker safety profile →
            </Link>
            <p className="mt-1 text-xs text-[#64748b]">
              Non-negative results apply medical restrictions and training suspensions automatically.
            </p>
          </WorkspaceSection>
        </div>
      )}

      {tab === "custody" && <ChainOfCustodyPanel test={test} onUpdate={load} />}
      {tab === "result" && <ResultRecordingForm test={test} onComplete={load} />}
      {tab === "documents" && <TestDocumentsPanel test={test} onUpdate={load} />}
    </div>
  );
}
