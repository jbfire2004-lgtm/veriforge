"use client";

import { useState } from "react";
import { addPmIncidentRca } from "@/lib/pm-incidents";
import { Button } from "@/components/ui/button";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";

type Props = {
  eventId: string;
  onAdded?: () => void;
};

const EMPTY = ["", "", "", "", ""];

export function FiveWhyRcaPanel({ eventId, onAdded }: Props) {
  const [whys, setWhys] = useState<string[]>([...EMPTY]);
  const [rootStatement, setRootStatement] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function setWhy(index: number, value: string) {
    setWhys((prev) => prev.map((w, i) => (i === index ? value : w)));
  }

  async function submit() {
    const chain = whys.map((w) => w.trim()).filter(Boolean);
    const description =
      rootStatement.trim() || chain[chain.length - 1] || "";
    if (!description || chain.length < 2) {
      setMessage("Enter at least two Why steps and a root-cause statement.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await addPmIncidentRca(eventId, {
        method: "five_why",
        description,
        whyChain: chain,
        category: "five_why",
        responsibleParty: "supervisor",
      });
      setWhys([...EMPTY]);
      setRootStatement("");
      setMessage("5-Why root cause saved. Corrective action generated.");
      onAdded?.();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to save 5-Why");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="vs-panel space-y-4 p-4">
      <div>
        <p className="vs-eyebrow">5-Why analysis</p>
        <p className="mt-1 text-xs" style={{ color: VS_COLORS.muted }}>
          Drill from the problem to the systemic cause. Each answer becomes the
          next Why. Industry standard used across Intelex / ISN investigations.
        </p>
      </div>

      <ol className="space-y-3">
        {whys.map((why, i) => (
          <li key={i} className="space-y-1">
            <label
              className="text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: VS_COLORS.muted }}
            >
              Why {i + 1}
            </label>
            <input
              className="w-full rounded border bg-transparent px-3 py-2 text-sm"
              style={{
                borderColor: VS_COLORS.border,
                color: VS_COLORS.white,
              }}
              placeholder={
                i === 0
                  ? "Why did the incident occur?"
                  : `Why did “${whys[i - 1]?.slice(0, 40) || "previous answer"}” happen?`
              }
              value={why}
              onChange={(e) => setWhy(i, e.target.value)}
            />
          </li>
        ))}
      </ol>

      <div className="space-y-1">
        <label
          className="text-[11px] font-semibold uppercase tracking-wide"
          style={{ color: VS_COLORS.muted }}
        >
          Root cause statement
        </label>
        <textarea
          className="min-h-[72px] w-full rounded border bg-transparent px-3 py-2 text-sm"
          style={{
            borderColor: VS_COLORS.border,
            color: VS_COLORS.white,
          }}
          placeholder="Systemic root cause that will drive corrective action…"
          value={rootStatement}
          onChange={(e) => setRootStatement(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" size="sm" disabled={busy} onClick={() => void submit()}>
          {busy ? "Saving…" : "Save 5-Why + generate action"}
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
