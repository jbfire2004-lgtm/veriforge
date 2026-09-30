"use client";

import { useEffect, useState } from "react";
import {
  SclHecaEnergyPanel,
  type SclHecaEnergyValue,
} from "@/components/sms/SclHecaEnergyPanel";
import {
  fetchHecaLibrary,
  mapFindingSeverity,
  tagInspectionFinding,
  type SmsHecaLibraryEntry,
} from "@/lib/pm-sms-core";
import type { PmInspectionPhotoFinding } from "@/lib/pm-inspections";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";

function findingToSmsValue(finding: PmInspectionPhotoFinding): SclHecaEnergyValue {
  return {
    sclState: (finding.sclState as SclHecaEnergyValue["sclState"]) ?? undefined,
    hecaInvolved: finding.hecaInvolved ?? false,
    hecaCategoryCode: finding.hecaCategoryCode ?? undefined,
    energyTypes: finding.energyTypes ?? [],
    highEnergyFlag: finding.highEnergyFlag ?? false,
  };
}

type Props = {
  finding: PmInspectionPhotoFinding;
  companyId: number;
  projectId: number;
  hecaOptions?: Array<{ code: string; title: string }>;
  onSaved?: () => void;
};

export function InspectionFindingSmsTagPanel({
  finding,
  companyId,
  projectId,
  hecaOptions = [],
  onSaved,
}: Props) {
  const [value, setValue] = useState<SclHecaEnergyValue>(() => findingToSmsValue(finding));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    setNote(null);
    try {
      await tagInspectionFinding(finding.id, {
        companyId,
        projectId,
        baseSeverity: mapFindingSeverity(finding.severity),
        sclState: value.sclState,
        hecaInvolved: value.hecaInvolved,
        hecaCategoryCode: value.hecaCategoryCode,
        energyTypes: value.energyTypes,
        energyControlState: value.energyControlState,
        highEnergyFlag: value.highEnergyFlag,
      });
      setNote("SMS risk tags saved.");
      onSaved?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save SMS tags.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 border-t border-slate-200 pt-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        SMS risk classification
      </p>
      <SclHecaEnergyPanel
        value={value}
        onChange={setValue}
        hecaOptions={hecaOptions}
        compact
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <SfButton type="button" size="sm" disabled={busy} onClick={() => void save()}>
          {busy ? "Saving…" : "Apply SMS tags"}
        </SfButton>
        {note ? <span className="text-xs text-emerald-700">{note}</span> : null}
        {error ? <span className="text-xs text-red-600">{error}</span> : null}
      </div>
    </div>
  );
}

export function InspectionPhotoFindingsSmsSection({
  findings,
  companyId,
  projectId,
  onUpdated,
}: {
  findings: PmInspectionPhotoFinding[];
  companyId: number;
  projectId: number;
  onUpdated?: () => void;
}) {
  const [hecaOptions, setHecaOptions] = useState<Array<{ code: string; title: string }>>([]);

  useEffect(() => {
    void fetchHecaLibrary(companyId, projectId)
      .then((rows) =>
        setHecaOptions(
          (rows as SmsHecaLibraryEntry[]).map((h) => ({ code: h.code, title: h.title })),
        ),
      )
      .catch(() => undefined);
  }, [companyId, projectId]);

  if (!findings.length) return null;

  return (
    <SfCard className="space-y-4 p-5">
      <div>
        <h2 className="font-semibold text-[#2A2E33]">Photo findings — SMS tagging</h2>
        <p className="mt-1 text-sm text-[#5a6b7c]">
          Apply SCL, HECA, and Energy Wheel tags to AI-assisted findings before escalation or CAPA.
        </p>
      </div>
      <ul className="divide-y divide-slate-200">
        {findings.map((f) => (
          <li key={f.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-sm text-slate-900">{f.title}</p>
                <p className="text-xs capitalize text-slate-500">
                  {f.severity} · {f.category.replace(/_/g, " ")}
                  {f.sclState ? ` · SCL ${f.sclState}` : ""}
                </p>
              </div>
            </div>
            <InspectionFindingSmsTagPanel
              finding={f}
              companyId={companyId}
              projectId={projectId}
              hecaOptions={hecaOptions}
              onSaved={onUpdated}
            />
          </li>
        ))}
      </ul>
    </SfCard>
  );
}
