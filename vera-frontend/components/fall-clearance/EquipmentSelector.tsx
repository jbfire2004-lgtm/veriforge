"use client";

import type { EquipmentProfile } from "./types";

export function EquipmentSelector({
  equipmentList,
  selectedId,
  onSelect,
}: {
  equipmentList: EquipmentProfile[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <h3 className="mb-2 font-semibold text-[var(--foreground)]">Equipment</h3>
      <select
        className="w-full rounded-[3px] border border-[var(--border)] bg-[var(--surface)] p-2 text-sm text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        value={selectedId}
        onChange={(e) => onSelect(e.target.value)}
        aria-label="Select fall protection equipment"
      >
        <option value="">Select equipment</option>
        {equipmentList.map((eq) => (
          <option key={eq.id} value={eq.id}>
            {eq.manufacturer} – {eq.model} ({eq.type})
          </option>
        ))}
      </select>
    </div>
  );
}
