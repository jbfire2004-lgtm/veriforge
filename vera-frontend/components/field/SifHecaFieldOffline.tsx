"use client";

import { useCallback, useEffect, useState } from "react";
import {
  autosaveSifHecaFieldDraft,
  defaultSifHecaFieldDraft,
  submitSifHecaFieldOffline,
  type FieldSifControlRow,
  type FieldSifHazardRow,
  type SifHecaFieldDraft,
} from "@/lib/field/workflows/sif-heca";
import { useFieldMode } from "./FieldModeProvider";
import { JHA_ENERGY_TYPES } from "@/src/components/pm/jha-energy-analysis";
import { Button, Input, Label, Textarea, Card, CardContent } from "@/components/ui";

const LABELS: Record<"SIF" | "HECA", { title: string; hint: string }> = {
  SIF: {
    title: "SIF review",
    hint: "Document life-critical hazards, controls, and energy before work proceeds.",
  },
  HECA: {
    title: "HECA assessment",
    hint: "Document high-energy hazards, isolation needs, and control adequacy.",
  },
};

export function SifHecaFieldOffline({
  kind,
  companyId = 1,
  projectId = 1,
  siteId,
}: {
  kind: "SIF" | "HECA";
  companyId?: number;
  projectId?: number;
  siteId?: number;
}) {
  const { cache, queue } = useFieldMode();
  const [draft, setDraft] = useState<SifHecaFieldDraft>(() =>
    defaultSifHecaFieldDraft(kind, companyId, projectId, siteId),
  );
  const [status, setStatus] = useState<string | null>(null);

  const patch = useCallback((next: Partial<SifHecaFieldDraft>) => {
    setDraft((d) => ({ ...d, ...next }));
  }, []);

  const patchHazard = (index: number, next: Partial<FieldSifHazardRow>) => {
    setDraft((d) => {
      const hazards = [...d.hazards];
      hazards[index] = { ...hazards[index], ...next };
      return { ...d, hazards };
    });
  };

  const patchControl = (index: number, next: Partial<FieldSifControlRow>) => {
    setDraft((d) => {
      const controls = [...d.controls];
      controls[index] = { ...controls[index], ...next };
      return { ...d, controls };
    });
  };

  useEffect(() => {
    const t = setInterval(() => {
      void autosaveSifHecaFieldDraft(draft);
    }, 8000);
    return () => clearInterval(t);
  }, [draft]);

  useEffect(() => {
    void autosaveSifHecaFieldDraft(draft);
  }, [draft.clientSyncId]);

  async function queueSync(submit: boolean) {
    if (!cache || !queue) {
      setStatus("Field mode not ready — enable offline mode first.");
      return;
    }
    if (!draft.title.trim() && !draft.jobDescription.trim()) {
      setStatus("Enter activity title or job description.");
      return;
    }
    if (submit && !draft.hazards.some((h) => h.description.trim())) {
      setStatus("Add at least one hazard before submit.");
      return;
    }
    const res = await submitSifHecaFieldOffline(cache, queue, draft, { submit });
    setStatus(
      submit
        ? `Scored when synced — queue #${res.queueId.slice(0, 8)}`
        : `Saved offline — queue #${res.queueId.slice(0, 8)}`,
    );
  }

  function toggleEnergy(id: string) {
    patch({
      energyTypes: draft.energyTypes.includes(id)
        ? draft.energyTypes.filter((e) => e !== id)
        : [...draft.energyTypes, id],
    });
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div>
          <h2 className="text-lg font-semibold">{LABELS[kind].title}</h2>
          <p className="text-xs text-muted-foreground">{LABELS[kind].hint}</p>
          <p className="text-xs text-muted-foreground">Project #{projectId} · syncs to SIF/HECA engine</p>
        </div>

        <div>
          <Label>Activity title</Label>
          <Input
            value={draft.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder="Work activity"
          />
        </div>

        <div>
          <Label>Job description</Label>
          <Textarea
            value={draft.jobDescription}
            onChange={(e) => patch({ jobDescription: e.target.value })}
            rows={2}
          />
        </div>

        <div>
          <Label>Work scope / steps</Label>
          <Textarea
            value={draft.workScope}
            onChange={(e) => patch({ workScope: e.target.value })}
            rows={2}
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <Label>Location</Label>
            <Input
              value={draft.locationNote}
              onChange={(e) => patch({ locationNote: e.target.value })}
            />
          </div>
          <div>
            <Label>Environment</Label>
            <Input
              value={draft.environmentNote}
              onChange={(e) => patch({ environmentNote: e.target.value })}
              placeholder="Weather, ground, congestion"
            />
          </div>
        </div>

        <div>
          <Label>Equipment / tools</Label>
          <Input
            value={draft.equipmentNote}
            onChange={(e) => patch({ equipmentNote: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Hazards {kind === "SIF" ? "(SIF focus)" : "(high-energy focus)"}</Label>
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
                  {
                    description: "",
                    severity: kind === "SIF" ? 4 : 3,
                    likelihood: 3,
                    energyTypes: [],
                  },
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
                value={c.controlType}
                onChange={(e) => patchControl(i, { controlType: e.target.value })}
              >
                <option value="engineering">Engineering</option>
                <option value="administrative">Administrative</option>
                <option value="ppe">PPE</option>
                <option value="elimination">Elimination</option>
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
                    ? "bg-red-700 text-white"
                    : "border border-muted-foreground/30"
                }`}
              >
                {e.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>Worker ID (optional)</Label>
          <Input
            type="number"
            value={draft.workerId ?? ""}
            onChange={(e) =>
              patch({ workerId: e.target.value ? Number(e.target.value) : null })
            }
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => void queueSync(false)}>
            Save draft offline
          </Button>
          <Button type="button" variant="primary" onClick={() => void queueSync(true)}>
            Score when synced
          </Button>
        </div>

        {status ? <p className="text-sm text-teal-800">{status}</p> : null}
      </CardContent>
    </Card>
  );
}
