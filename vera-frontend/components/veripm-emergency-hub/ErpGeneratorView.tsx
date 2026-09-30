"use client";

import { useState } from "react";
import Link from "next/link";
import {
  generateErpDocument,
  type ErpFullDocument,
  type ErpScenario,
} from "@/lib/erp-generator";
import { ErpDocumentPanel } from "@/components/veripm-emergency-hub/ErpDocumentPanel";
import { VeraPageLayout } from "@/src/components/navigation";
import { SfButton, SfCard, SfInput } from "@/src/components/safety-forms/ui";
import { SfFloatingTextarea } from "@/src/components/safety-forms/ui/SfFloatingTextarea";

const SCENARIOS: Array<{ id: ErpScenario; label: string }> = [
  { id: "general", label: "General emergency" },
  { id: "electrical", label: "Electrical / arc" },
  { id: "fall", label: "Fall from height" },
  { id: "trench", label: "Trench / excavation" },
  { id: "chemical", label: "Chemical release" },
  { id: "rollover", label: "Equipment rollover" },
];

const REGIONS = [
  { id: "CA-SK", label: "Saskatchewan (CA-SK)" },
  { id: "CA-AB", label: "Alberta (CA-AB)" },
  { id: "CA-BC", label: "British Columbia (CA-BC)" },
  { id: "CA-MB", label: "Manitoba (CA-MB)" },
  { id: "CA-ON", label: "Ontario (CA-ON)" },
];

export function ErpGeneratorView({
  projectId = 1,
  companyId = 1,
}: {
  projectId?: number;
  companyId?: number;
}) {
  const q = `projectId=${projectId}&companyId=${companyId}`;
  const [title, setTitle] = useState("Site Emergency Response Plan");
  const [workType, setWorkType] = useState("Civil / underground");
  const [projectScope, setProjectScope] = useState("");
  const [regionCode, setRegionCode] = useState("CA-SK");
  const [scenario, setScenario] = useState<ErpScenario>("general");
  const [hazardsText, setHazardsText] = useState(
    "gas line proximity, excavation, mobile equipment",
  );
  const [musterPrimary, setMusterPrimary] = useState("Muster Point A — Gate 1");
  const [musterAlt, setMusterAlt] = useState("Muster Point B — North parking");
  const [radioChannel, setRadioChannel] = useState("Ch 1 — Emergency");
  const [phoneTree, setPhoneTree] = useState(
    "Coordinator → Supervisor → Company HSE → Client",
  );
  const [equipmentText, setEquipmentText] = useState(
    "First-aid kit @ trailer; Fire extinguisher @ fuel area; Spill kit @ chemical storage",
  );
  const [coordPrimary, setCoordPrimary] = useState("");
  const [wardenPrimary, setWardenPrimary] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [document, setDocument] = useState<ErpFullDocument | null>(null);
  const [notes, setNotes] = useState<string[]>([]);

  async function runGenerate() {
    setBusy(true);
    setError(null);
    try {
      const equipment = equipmentText
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((line) => {
          const [namePart, locPart] = line.split("@").map((x) => x.trim());
          return {
            name: namePart || line,
            location: locPart || undefined,
            qty: 1,
          };
        });

      const res = await generateErpDocument({
        projectId,
        companyId,
        title: title.trim() || "Emergency Response Plan",
        workType: workType.trim() || "Field work",
        regionCode,
        projectScope: projectScope.trim() || undefined,
        scenario,
        hazards: hazardsText
          .split(",")
          .map((h) => h.trim())
          .filter(Boolean),
        includeEmsIds:
          regionCode === "CA-SK"
            ? ["ems-ca-sk-ems", "ems-ca-sk-fire"]
            : regionCode === "CA-BC"
              ? ["ems-ca-bc-ems"]
              : ["ems-ca-ab-ems", "ems-ca-ab-fire"],
        userInputs: {
          musterPoints: [
            { name: musterPrimary, description: "Primary assembly" },
            ...(musterAlt
              ? [{ name: musterAlt, description: "Alternate assembly" }]
              : []),
          ],
          equipment,
          roles: [
            {
              role: "Site emergency coordinator",
              primaryName: coordPrimary || undefined,
            },
            {
              role: "Muster warden",
              primaryName: wardenPrimary || undefined,
            },
            { role: "First aider" },
            { role: "Communications lead" },
          ],
          communication: {
            radioChannel,
            phoneTree,
            assemblySignal: "Continuous air horn / radio EMERGENCY MUSTER",
            allClearSignal: "Radio ALL CLEAR from coordinator only",
          },
          additionalHazards: hazardsText
            .split(",")
            .map((h) => h.trim())
            .filter(Boolean),
        },
      });
      setDocument(res.document);
      setNotes(res.notes ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ERP generation failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <VeraPageLayout
      title="ERP generator"
      description="Auto-populate project data, integrate hazards & readiness, apply provincial OHS dangerous-occurrence rules, route utility contacts (e.g. SaskEnergy), capture muster / equipment / roles / communications, and produce the final ERP document."
    >
      <div className="mb-3 flex flex-wrap gap-3 text-sm">
        <Link
          href={`/pm/emergency-response?${q}`}
          className="text-[var(--sf-primary)] hover:underline"
        >
          ← Emergency hub
        </Link>
        <Link
          href={`/pm/projects?${q}`}
          className="text-[var(--sf-primary)] hover:underline"
        >
          Projects
        </Link>
        <Link
          href={`/pm/jha-flha?${q}`}
          className="text-[var(--sf-primary)] hover:underline"
        >
          JHA / FLHA hazards
        </Link>
        <Link
          href={`/pm/sif-heca?${q}`}
          className="text-[var(--sf-primary)] hover:underline"
        >
          SIF / HECA readiness
        </Link>
      </div>

      <SfCard className="space-y-4 p-5">
        <h2 className="font-medium">1. Project & scenario</h2>
        <p className="text-xs text-[var(--sf-text-muted)]">
          Project #{projectId} / company #{companyId} — generator pulls project
          name, site, and readiness signals from the backend when available.
        </p>
        <SfInput
          placeholder="ERP title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <SfInput
            placeholder="Work type"
            value={workType}
            onChange={(e) => setWorkType(e.target.value)}
          />
          <select
            className="rounded border border-[var(--sf-border)] bg-transparent px-3 py-2 text-sm"
            value={regionCode}
            onChange={(e) => setRegionCode(e.target.value)}
          >
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <select
          className="w-full rounded border border-[var(--sf-border)] bg-transparent px-3 py-2 text-sm"
          value={scenario}
          onChange={(e) => setScenario(e.target.value as ErpScenario)}
        >
          {SCENARIOS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <SfFloatingTextarea
          label="Project scope"
          value={projectScope}
          onChange={(e) => setProjectScope(e.target.value)}
          rows={2}
        />
        <SfFloatingTextarea
          label="Hazards (comma-separated) — include “gas line” for SaskEnergy routing"
          value={hazardsText}
          onChange={(e) => setHazardsText(e.target.value)}
          rows={2}
        />
      </SfCard>

      <SfCard className="space-y-4 p-5">
        <h2 className="font-medium">2. Muster, equipment, roles & communications</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <SfInput
            placeholder="Primary muster point"
            value={musterPrimary}
            onChange={(e) => setMusterPrimary(e.target.value)}
          />
          <SfInput
            placeholder="Alternate muster point"
            value={musterAlt}
            onChange={(e) => setMusterAlt(e.target.value)}
          />
        </div>
        <SfFloatingTextarea
          label="Emergency equipment (semicolon-separated; use Name @ Location)"
          value={equipmentText}
          onChange={(e) => setEquipmentText(e.target.value)}
          rows={2}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <SfInput
            placeholder="Emergency coordinator name"
            value={coordPrimary}
            onChange={(e) => setCoordPrimary(e.target.value)}
          />
          <SfInput
            placeholder="Muster warden name"
            value={wardenPrimary}
            onChange={(e) => setWardenPrimary(e.target.value)}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <SfInput
            placeholder="Radio channel"
            value={radioChannel}
            onChange={(e) => setRadioChannel(e.target.value)}
          />
          <SfInput
            placeholder="Phone tree"
            value={phoneTree}
            onChange={(e) => setPhoneTree(e.target.value)}
          />
        </div>
        <SfButton
          type="button"
          onClick={() => void runGenerate()}
          disabled={busy}
        >
          {busy ? "Generating ERP…" : "Generate ERP document"}
        </SfButton>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {notes.length > 0 ? (
          <ul className="rounded border border-[var(--sf-border)] bg-[var(--sf-surface-muted)] px-3 py-2 text-xs text-[var(--sf-text-muted)]">
            {notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        ) : null}
      </SfCard>

      {document ? <ErpDocumentPanel document={document} /> : null}
    </VeraPageLayout>
  );
}
