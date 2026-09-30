"use client";

import {
  JhaLibraryPicker,
  type LibraryEntry,
} from "@/src/components/pm/JhaLibraryPicker";
import type { HazardCatalogEntry } from "@/lib/hazard-control-catalog";

type HazardSelectorProps = {
  hazards: HazardCatalogEntry[];
  suggested?: LibraryEntry[];
  missed?: LibraryEntry[];
  crewOftenAdds?: { hazards: LibraryEntry[]; controls: LibraryEntry[] };
  warnings?: string[];
  disabled?: boolean;
  categoryCounts?: Record<string, number>;
  onPick: (entry: LibraryEntry) => void;
  onAddCustom: (text: string, meta?: { category?: string }) => void;
};

export function HazardSelector({
  hazards,
  suggested = [],
  missed = [],
  crewOftenAdds,
  warnings = [],
  disabled,
  categoryCounts,
  onPick,
  onAddCustom,
}: HazardSelectorProps) {
  const entries: LibraryEntry[] = hazards.map((h) => ({
    id: h.id,
    category: h.category,
    description: h.description,
    defaultEnergyTypes: h.defaultEnergyTypes,
  }));

  return (
    <div className="space-y-2">
      {categoryCounts && Object.keys(categoryCounts).length > 0 ? (
        <p className="text-xs text-[var(--sf-text-muted)]">
          {hazards.length} hazards across{" "}
          {Object.entries(categoryCounts)
            .slice(0, 6)
            .map(([cat, n]) => `${cat} (${n})`)
            .join(" · ")}
          {Object.keys(categoryCounts).length > 6 ? " …" : ""}
        </p>
      ) : null}
      <JhaLibraryPicker
        mode="hazard"
        entries={entries}
        suggested={suggested}
        missed={missed}
        crewOftenAdds={crewOftenAdds}
        warnings={warnings}
        disabled={disabled}
        onPick={onPick}
        onAddCustom={onAddCustom}
      />
    </div>
  );
}
