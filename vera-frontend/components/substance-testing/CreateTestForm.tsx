"use client";

import { useState } from "react";
import {
  createSubstanceTest,
  TEST_TYPE_LABELS,
  type SubstanceTestType,
} from "@/lib/pm-substance-testing";
import { Button } from "@/components/ui/button";
import { WorkspaceSection } from "@/components/theme/workspace";

type Props = {
  companyId: number;
  projectId?: number;
  workerId: number;
  workerName: string;
  incidentEventId?: string;
  defaultType?: SubstanceTestType;
  onCreated: (testId: string) => void;
};

export function CreateTestForm({
  companyId,
  projectId,
  workerId,
  workerName,
  incidentEventId,
  defaultType = "random",
  onCreated,
}: Props) {
  const [testType, setTestType] = useState<SubstanceTestType>(defaultType);
  const [specimenType, setSpecimenType] = useState("urine");
  const [suspicionNotes, setSuspicionNotes] = useState("");
  const [collectionSite, setCollectionSite] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      const test = await createSubstanceTest({
        companyId,
        projectId,
        workerId,
        testType,
        specimenType,
        incidentEventId,
        suspicionNotes: testType === "reasonable_suspicion" ? suspicionNotes : undefined,
        collectionSiteNote: collectionSite || undefined,
        scheduledAt: new Date().toISOString(),
      });
      onCreated(test.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <WorkspaceSection
      title="Schedule test"
      description={`Worker: ${workerName}`}
    >
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-[#64748b]">Test type</label>
          <select
            className="mt-1 w-full rounded-lg border border-[#2A2E33]/10 px-3 py-2 text-sm"
            value={testType}
            onChange={(e) => setTestType(e.target.value as SubstanceTestType)}
          >
            {(Object.keys(TEST_TYPE_LABELS) as SubstanceTestType[]).map((t) => (
              <option key={t} value={t}>
                {TEST_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-[#64748b]">Specimen</label>
          <select
            className="mt-1 w-full rounded-lg border border-[#2A2E33]/10 px-3 py-2 text-sm"
            value={specimenType}
            onChange={(e) => setSpecimenType(e.target.value)}
          >
            <option value="urine">Urine</option>
            <option value="oral_fluid">Oral fluid</option>
            <option value="breath_alcohol">Breath alcohol</option>
          </select>
        </div>

        {testType === "reasonable_suspicion" ? (
          <textarea
            className="w-full rounded-lg border border-[#2A2E33]/10 px-3 py-2 text-sm"
            rows={4}
            placeholder="Document observed behavior, signs, and symptoms (required)…"
            value={suspicionNotes}
            onChange={(e) => setSuspicionNotes(e.target.value)}
          />
        ) : null}

        <input
          className="w-full rounded-lg border border-[#2A2E33]/10 px-3 py-2 text-sm"
          placeholder="Collection site (optional)"
          value={collectionSite}
          onChange={(e) => setCollectionSite(e.target.value)}
        />

        <Button
          type="button"
          size="sm"
          disabled={
            busy ||
            (testType === "reasonable_suspicion" && !suspicionNotes.trim())
          }
          onClick={() => void submit()}
        >
          {busy ? "Scheduling…" : "Schedule test"}
        </Button>
      </div>
    </WorkspaceSection>
  );
}
