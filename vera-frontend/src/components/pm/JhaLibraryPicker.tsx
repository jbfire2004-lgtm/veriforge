"use client";

import { useMemo } from "react";
import {
  JhaCreatableSelect,
  type JhaSelectEntry,
  controlTypeLabel,
} from "@/src/components/pm/JhaCreatableSelect";

export type LibraryEntry = JhaSelectEntry & {
  score?: number;
};

type CrewOftenAdds = {
  hazards: LibraryEntry[];
  controls: LibraryEntry[];
};

type Props = {
  mode: "hazard" | "control";
  entries: LibraryEntry[];
  suggested?: LibraryEntry[];
  missed?: LibraryEntry[];
  crewOftenAdds?: CrewOftenAdds;
  warnings?: string[];
  disabled?: boolean;
  onPick: (entry: LibraryEntry) => void;
  onAddCustom: (text: string, meta?: { category?: string; controlType?: string }) => void;
  selectedHazardCategory?: string;
  focusedHazardLabel?: string;
};

export function JhaLibraryPicker({
  mode,
  entries,
  suggested = [],
  missed = [],
  crewOftenAdds,
  warnings = [],
  disabled,
  onPick,
  onAddCustom,
  selectedHazardCategory,
  focusedHazardLabel,
}: Props) {
  const crewItems = mode === "hazard" ? crewOftenAdds?.hazards : crewOftenAdds?.controls;

  const quickPickPills = useMemo(() => {
    const pills: { id: string; label: string; entry: LibraryEntry }[] = [];
    const seen = new Set<string>();

    for (const e of [...(crewItems ?? []), ...suggested]) {
      const key = e.description.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const prefix =
        mode === "hazard"
          ? e.category ?? "Hazard"
          : e.controlClass === "direct"
            ? "Direct"
            : e.controlClass === "alternative"
              ? "Alt"
              : controlTypeLabel(e.controlType ?? "control");
      const short = e.description.length > 40 ? `${e.description.slice(0, 40)}…` : e.description;
      pills.push({
        id: key,
        label: e.count ? `${prefix}: ${short} (${e.count}×)` : `${prefix}: ${short}`,
        entry: e,
      });
      if (pills.length >= 8) break;
    }
    return pills;
  }, [crewItems, suggested, mode]);

  return (
    <div className="space-y-4 rounded-lg border border-[var(--sf-border)] bg-[var(--sf-surface-muted)]/40 p-4">
      {warnings.length > 0 ? (
        <ul className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      ) : null}

      {mode === "control" && focusedHazardLabel ? (
        <div className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-900">
          <span className="font-medium">Linking controls to:</span> {focusedHazardLabel}
        </div>
      ) : null}

      {missed.length > 0 ? (
        <div className="space-y-2 rounded-md border border-amber-300 bg-amber-50/80 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-900">
            Likely gaps for this task
          </p>
          <div className="flex flex-wrap gap-2">
            {missed.slice(0, 6).map((e) => (
              <button
                key={e.description}
                type="button"
                disabled={disabled}
                title={e.reason}
                className="rounded-full border border-amber-400 bg-white px-3 py-1 text-xs font-medium text-amber-950 hover:bg-amber-100 disabled:opacity-50"
                onClick={() => onPick(e)}
              >
                + {e.description.slice(0, 44)}
                {e.description.length > 44 ? "…" : ""}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {quickPickPills.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--sf-text-muted)]">
            {crewItems?.length ? "Quick picks — crew & task suggestions" : "Quick picks"}
          </p>
          <div className="flex flex-wrap gap-2">
            {quickPickPills.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={disabled}
                title={p.entry.reason}
                className="rounded-full border border-[var(--sf-border)] bg-[var(--sf-surface)] px-3 py-1 text-left text-xs font-medium text-[var(--sf-text)] transition-colors hover:border-[var(--sf-primary)] hover:bg-[var(--sf-primary-muted)] disabled:opacity-50"
                onClick={() => onPick(p.entry)}
              >
                + {p.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <JhaCreatableSelect
        label={mode === "hazard" ? "Hazard identification" : "Control measures (Hierarchy of Controls)"}
        mode={mode}
        entries={entries}
        disabled={disabled}
        defaultCategory={selectedHazardCategory ?? "Field"}
        helperText={
          mode === "hazard"
            ? "Select from the library or type a hazard not listed — press Enter to add."
            : "Direct controls target energy at the source; alternative controls reduce exposure or error indirectly. Filter by class or type, then select or type custom."
        }
        onSelect={onPick}
        onCreateCustom={onAddCustom}
      />
    </div>
  );
}
