"use client";

import { useState } from "react";
import { addPmIncidentRca } from "@/lib/pm-incidents";
import { Button } from "@/components/ui/button";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";

const CATEGORIES = [
  { key: "people", label: "People" },
  { key: "process", label: "Process / methods" },
  { key: "equipment", label: "Equipment / tools" },
  { key: "materials", label: "Materials" },
  { key: "environment", label: "Environment" },
  { key: "management", label: "Management / systems" },
] as const;

type Props = {
  eventId: string;
  onAdded?: () => void;
};

export function FishboneRcaPanel({ eventId, onAdded }: Props) {
  const [bones, setBones] = useState<Record<string, string>>(
    Object.fromEntries(CATEGORIES.map((c) => [c.key, ""])),
  );
  const [effect, setEffect] = useState("");
  const [rootStatement, setRootStatement] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit() {
    const fishboneJson: Record<string, string[]> = {};
    for (const c of CATEGORIES) {
      const items = bones[c.key]
        .split(/[\n;]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (items.length) fishboneJson[c.key] = items;
    }
    const description =
      rootStatement.trim() ||
      Object.values(fishboneJson).flat()[0] ||
      "";
    if (!description || Object.keys(fishboneJson).length === 0) {
      setMessage("Add causes on at least one bone and a root-cause statement.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await addPmIncidentRca(eventId, {
        method: "fishbone",
        description,
        category: "fishbone",
        fishboneJson: { effect: effect.trim() || undefined, ...fishboneJson },
        responsibleParty: "supervisor",
      });
      setBones(Object.fromEntries(CATEGORIES.map((c) => [c.key, ""])));
      setEffect("");
      setRootStatement("");
      setMessage("Fishbone root cause saved. Corrective action generated.");
      onAdded?.();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to save fishbone");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="vs-panel space-y-4 p-4">
      <div>
        <p className="vs-eyebrow">Ishikawa / fishbone</p>
        <p className="mt-1 text-xs" style={{ color: VS_COLORS.muted }}>
          Map contributing causes across the classic 6M categories. List multiple
          causes per bone (one per line).
        </p>
      </div>

      <div className="space-y-1">
        <label
          className="text-[11px] font-semibold uppercase tracking-wide"
          style={{ color: VS_COLORS.muted }}
        >
          Effect (problem statement)
        </label>
        <input
          className="w-full rounded border bg-transparent px-3 py-2 text-sm"
          style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
          placeholder="What undesired outcome are we analyzing?"
          value={effect}
          onChange={(e) => setEffect(e.target.value)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c) => (
          <div key={c.key} className="space-y-1">
            <label
              className="text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: VS_COLORS.blue }}
            >
              {c.label}
            </label>
            <textarea
              className="min-h-[88px] w-full rounded border bg-transparent px-3 py-2 text-sm"
              style={{
                borderColor: VS_COLORS.border,
                color: VS_COLORS.white,
              }}
              placeholder="One cause per line…"
              value={bones[c.key]}
              onChange={(e) =>
                setBones((prev) => ({ ...prev, [c.key]: e.target.value }))
              }
            />
          </div>
        ))}
      </div>

      <div className="space-y-1">
        <label
          className="text-[11px] font-semibold uppercase tracking-wide"
          style={{ color: VS_COLORS.muted }}
        >
          Primary root cause
        </label>
        <textarea
          className="min-h-[72px] w-full rounded border bg-transparent px-3 py-2 text-sm"
          style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
          placeholder="The systemic cause that corrective action must address…"
          value={rootStatement}
          onChange={(e) => setRootStatement(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" size="sm" disabled={busy} onClick={() => void submit()}>
          {busy ? "Saving…" : "Save fishbone + generate action"}
        </Button>
        {message ? (
          <p className="text-xs" style={{ color: VS_COLORS.muted }}>
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
