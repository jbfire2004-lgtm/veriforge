"use client";

import { useCallback, useEffect, useState } from "react";
import {
  autosaveJhaFlhaFieldDraft,
  defaultJhaFlhaFieldDraft,
  submitJhaFlhaFieldOffline,
  type FieldControlRow,
  type FieldHazardRow,
  type JhaFlhaFieldDraft,
} from "@/lib/field/workflows/jha-flha";
import { useFieldMode } from "./FieldModeProvider";
import type { SafetyFormKind } from "@/lib/field";
import { JHA_ENERGY_TYPES } from "@/src/components/pm/jha-energy-analysis";
import { Button, Input, Label, Textarea, Card, CardContent } from "@/components/ui";

const LABELS: Record<"JHA" | "FLHA", string> = {
  JHA: "Job Hazard Analysis",
  FLHA: "Field Level Hazard Assessment",
};

export function JhaFlhaFieldOffline({
  kind,
  companyId = 1,
  projectId = 1,
  siteId,
}: {
  kind: "JHA" | "FLHA";
  companyId?: number;
  projectId?: number;
  siteId?: number;
}) {
  const { cache, queue } = useFieldMode();
  const [draft, setDraft] = useState<JhaFlhaFieldDraft>(() =>
    defaultJhaFlhaFieldDraft(kind, companyId, projectId, siteId),
  );
  const [status, setStatus] = useState<string | null>(null);
  const [equipmentInput, setEquipmentInput] = useState("");

  const patch = useCallback((next: Partial<JhaFlhaFieldDraft>) => {
    setDraft((d) => ({ ...d, ...next }));
  }, []);

  const patchHazard = (index: number, next: Partial<FieldHazardRow>) => {
    setDraft((d) => {
      const hazards = [...d.hazards];
      hazards[index] = { ...hazards[index], ...next };
      return { ...d, hazards };
    });
  };

  const patchControl = (index: number, next: Partial<FieldControlRow>) => {
    setDraft((d) => {
      const controls = [...d.controls];
      controls[index] = { ...controls[index], ...next };
      return { ...d, controls };
    });
  };

  useEffect(() => {
    const t = setInterval(() => {
      void autosaveJhaFlhaFieldDraft(draft);
    }, 8000);
    return () => clearInterval(t);
  }, [draft]);

  useEffect(() => {
    void autosaveJhaFlhaFieldDraft(draft);
  }, [draft.clientSyncId]);

  async function queueSync(submit: boolean) {
    if (!cache || !queue) {
      setStatus("Field mode not ready — enable offline mode first.");
      return;
    }
    if (!draft.taskDescription.trim()) {
      setStatus("Enter today's task before saving.");
      return;
    }
    if (submit && !draft.hazards.some((h) => h.description.trim())) {
      setStatus("Add at least one hazard before submit.");
      return;
    }
    const res = await submitJhaFlhaFieldOffline(cache, queue, draft, { submit });
    setStatus(
      submit
        ? `Submitted — queued sync #${res.queueId.slice(0, 8)}`
        : `Saved offline — queued sync #${res.queueId.slice(0, 8)}`,
    );
  }

  function toggleEnergy(id: string) {
    patch({
      energyTypes: draft.energyTypes.includes(id)
        ? draft.energyTypes.filter((e) => e !== id)
        : [...draft.energyTypes, id],
    });
  }

  function addEquipmentId() {
    const id = parseInt(equipmentInput, 10);
    if (!Number.isFinite(id) || id <= 0) return;
    if (!draft.equipmentIds.includes(id)) {
      patch({ equipmentIds: [...draft.equipmentIds, id] });
    }
    setEquipmentInput("");
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div>
          <h2 className="text-lg font-semibold">{LABELS[kind]}</h2>
          <p className="text-xs text-muted-foreground">
            Structured offline sync · project #{projectId}
          </p>
        </div>

        <div>
          <Label>Task / work activity</Label>
          <Textarea
            value={draft.taskDescription}
            onChange={(e) => patch({ taskDescription: e.target.value })}
            rows={2}
            placeholder={kind === "FLHA" ? "What are you doing right now?" : "Job or work package"}
          />
        </div>

        <div>
          <Label>Location</Label>
          <Input
            value={draft.locationNote}
            onChange={(e) => patch({ locationNote: e.target.value })}
            placeholder="Grid, level, work face"
          />
        </div>

        {kind === "JHA" ? (
          <div>
            <Label>Work scope</Label>
            <Textarea
              value={draft.workScope}
              onChange={(e) => patch({ workScope: e.target.value })}
              rows={2}
            />
          </div>
        ) : null}

        <div className="space-y-2">
          <Label>Hazards</Label>
          {draft.hazards.map((h, i) => (
            <div key={i} className="space-y-2 rounded-lg border p-3">
              <Input
                value={h.description}
                onChange={(e) => patchHazard(i, { description: e.target.value })}
                placeholder="Hazard description"
              />
              <div className="flex gap-2 text-xs">
                <label className="flex items-center gap-1">
                  Severity
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    className="h-8 w-14"
                    value={h.severity}
                    onChange={(e) => patchHazard(i, { severity: Number(e.target.value) })}
                  />
                </label>
                <label className="flex items-center gap-1">
                  Likelihood
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    className="h-8 w-14"
                    value={h.likelihood}
                    onChange={(e) => patchHazard(i, { likelihood: Number(e.target.value) })}
                  />
                </label>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              patch({
                hazards: [
                  ...draft.hazards,
                  { description: "", severity: 3, likelihood: 3, energyTypes: [] },
                ],
              })
            }
          >
            Add hazard
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Controls</Label>
          {draft.controls.map((c, i) => (
            <div key={i} className="flex flex-wrap gap-2 rounded-lg border p-3">
              <Input
                className="min-w-[12rem] flex-1"
                value={c.description}
                onChange={(e) => patchControl(i, { description: e.target.value })}
                placeholder="Control measure"
              />
              <select
                className="h-9 rounded-md border px-2 text-sm"
                value={c.hazardIndex ?? ""}
                onChange={(e) =>
                  patchControl(i, {
                    hazardIndex: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              >
                <option value="">General</option>
                {draft.hazards.map((_, hi) => (
                  <option key={hi} value={hi}>
                    Hazard #{hi + 1}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              patch({
                controls: [
                  ...draft.controls,
                  { description: "", controlType: "engineering", hazardIndex: 0 },
                ],
              })
            }
          >
            Add control
          </Button>
        </div>

        <div>
          <Label>Energy wheel</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {JHA_ENERGY_TYPES.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => toggleEnergy(e.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  draft.energyTypes.includes(e.id)
                    ? "bg-teal-700 text-white"
                    : "border border-muted-foreground/30"
                }`}
              >
                {e.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Equipment (authorized)</Label>
          <div className="flex gap-2">
            <Input
              value={equipmentInput}
              onChange={(e) => setEquipmentInput(e.target.value)}
              placeholder="Equipment ID"
            />
            <Button type="button" variant="outline" onClick={addEquipmentId}>
              Add
            </Button>
          </div>
          {draft.equipmentIds.length ? (
            <p className="text-xs text-muted-foreground">
              Linked: {draft.equipmentIds.join(", ")}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <Label>Worker ID</Label>
            <Input
              type="number"
              value={draft.workerId ?? ""}
              onChange={(e) =>
                patch({
                  workerId: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </div>
          <div>
            <Label>Signature (initials)</Label>
            <Input
              value={draft.signature}
              onChange={(e) => patch({ signature: e.target.value })}
              placeholder="Initials"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => void queueSync(false)}>
            Save draft offline
          </Button>
          <Button type="button" variant="primary" onClick={() => void queueSync(true)}>
            Submit when synced
          </Button>
        </div>

        {status ? <p className="text-sm text-teal-800">{status}</p> : null}
      </CardContent>
    </Card>
  );
}
