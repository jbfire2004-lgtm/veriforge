"use client";

import { useState } from "react";
import { addPmIncidentRca, type TaprootPathway } from "@/lib/pm-incidents";
import { Button } from "@/components/ui/button";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";

const PATHWAY_ICONS: Record<string, string> = {
  human_factors: "🧠",
  equipment_failure: "⚙️",
  procedures: "📋",
  training_gaps: "🎓",
  management_systems: "🏗️",
  environmental_conditions: "🌿",
};

type Props = {
  eventId: string;
  pathways: TaprootPathway[];
  onAdded?: () => void;
};

export function TaprootPathwaySelector({ eventId, pathways, onAdded }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [responsibleParty, setResponsibleParty] = useState<
    "contractor" | "supervisor" | "company" | "worker"
  >("supervisor");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit() {
    if (!selected || !description.trim()) return;
    setBusy(true);
    setMessage(null);
    try {
      await addPmIncidentRca(eventId, {
        method: "taproot",
        pathway: selected,
        category: selected,
        description,
        responsibleParty,
      });
      setDescription("");
      setSelected(null);
      setMessage("Root cause added. Corrective action generated.");
      onAdded?.();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to add root cause");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="vs-panel space-y-4 p-4">
      <div>
        <p className="vs-eyebrow">TapRooT® causal pathways</p>
        <p className="mt-1 text-xs" style={{ color: VS_COLORS.muted }}>
          Select the causal pathway, describe the root cause. A corrective action
          is auto-generated and linked to Action Management.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {pathways.map((p) => {
          const active = selected === p.key;
          return (
            <button
              key={p.key}
              type="button"
              className="rounded border p-3 text-left transition"
              style={{
                borderColor: active ? VS_COLORS.blue : VS_COLORS.border,
                background: active ? VS_COLORS.slate : "transparent",
              }}
              onClick={() => setSelected(p.key)}
            >
              <span className="text-xl">{PATHWAY_ICONS[p.key] ?? "🔍"}</span>
              <p
                className="mt-2 text-sm font-semibold"
                style={{ color: VS_COLORS.white }}
              >
                {p.label}
              </p>
              <p className="mt-1 text-xs" style={{ color: VS_COLORS.muted }}>
                {p.description}
              </p>
            </button>
          );
        })}
      </div>

      {selected ? (
        <div
          className="space-y-3 rounded border p-4"
          style={{ borderColor: VS_COLORS.border }}
        >
          <p className="text-sm font-medium" style={{ color: VS_COLORS.white }}>
            Root cause for:{" "}
            <strong>{pathways.find((p) => p.key === selected)?.label}</strong>
          </p>
          <textarea
            className="w-full rounded border bg-transparent px-3 py-2 text-sm"
            style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the root cause in this pathway…"
          />
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs" style={{ color: VS_COLORS.muted }}>
              Responsible party
            </label>
            <select
              className="rounded border bg-transparent px-3 py-1.5 text-sm"
              style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
              value={responsibleParty}
              onChange={(e) => setResponsibleParty(e.target.value as never)}
            >
              <option value="supervisor">Supervisor</option>
              <option value="contractor">Contractor</option>
              <option value="company">Company</option>
              <option value="worker">Worker</option>
            </select>
          </div>
          <Button
            type="button"
            size="sm"
            disabled={busy || !description.trim()}
            onClick={() => void submit()}
          >
            {busy ? "Saving…" : "Add root cause + generate action"}
          </Button>
          {message ? (
            <p className="text-xs" style={{ color: VS_COLORS.muted }}>
              {message}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
