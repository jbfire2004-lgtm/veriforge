"use client";

import {
  JhaLibraryPicker,
  type LibraryEntry,
} from "@/src/components/pm/JhaLibraryPicker";
import { controlTypeLabel } from "@/src/components/pm/JhaCreatableSelect";
import type { ControlCatalogEntry } from "@/lib/hazard-control-catalog";

type ControlSelectorProps = {
  controls: ControlCatalogEntry[];
  suggested?: LibraryEntry[];
  missed?: LibraryEntry[];
  crewOftenAdds?: { hazards: LibraryEntry[]; controls: LibraryEntry[] };
  warnings?: string[];
  disabled?: boolean;
  selectedHazardCategory?: string;
  focusedHazardLabel?: string;
  controlTypeCounts?: Record<string, number>;
  onPick: (entry: LibraryEntry) => void;
  onAddCustom: (text: string, meta?: { controlType?: string }) => void;
};

export function ControlSelector({
  controls,
  suggested = [],
  missed = [],
  crewOftenAdds,
  warnings = [],
  disabled,
  selectedHazardCategory,
  focusedHazardLabel,
  controlTypeCounts,
  onPick,
  onAddCustom,
}: ControlSelectorProps) {
  const entries: LibraryEntry[] = controls.map((c) => ({
    id: c.id,
    controlType: c.controlType,
    description: c.description,
    controlClass: c.controlClass,
    hazardCategories: c.hazardCategories,
  }));

  return (
    <div className="space-y-2">
      {controlTypeCounts && Object.keys(controlTypeCounts).length > 0 ? (
        <p className="text-xs text-[var(--sf-text-muted)]">
          {controls.length} controls —{" "}
          {Object.entries(controlTypeCounts)
            .slice(0, 5)
            .map(([type, n]) => `${controlTypeLabel(type)} (${n})`)
            .join(" · ")}
        </p>
      ) : null}
      <JhaLibraryPicker
        mode="control"
        entries={entries}
        suggested={suggested}
        missed={missed}
        crewOftenAdds={crewOftenAdds}
        warnings={warnings}
        disabled={disabled}
        selectedHazardCategory={selectedHazardCategory}
        focusedHazardLabel={focusedHazardLabel}
        onPick={onPick}
        onAddCustom={onAddCustom}
      />
    </div>
  );
}
