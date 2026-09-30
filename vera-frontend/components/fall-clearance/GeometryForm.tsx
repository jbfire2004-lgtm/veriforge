"use client";

import type { ConfigurationInstance } from "./types";

export function GeometryForm({
  value,
  onChange,
}: {
  value: ConfigurationInstance;
  onChange: (partial: Partial<ConfigurationInstance>) => void;
}) {
  return (
    <div>
      <h3 className="mb-2 font-semibold text-[var(--foreground)]">
        Geometry & Worker
      </h3>
      <div className="space-y-2">
        <label className="block text-sm text-[var(--foreground)]">
          Anchor height (m)
          <input
            type="number"
            step="0.1"
            min={0}
            className="mt-1 w-full rounded-[3px] border border-[var(--border)] bg-[var(--surface)] p-1 text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            value={value.anchorHeightM}
            onChange={(e) =>
              onChange({ anchorHeightM: Number(e.target.value) })
            }
          />
        </label>
        <label className="block text-sm text-[var(--foreground)]">
          Work surface height (m)
          <input
            type="number"
            step="0.1"
            min={0}
            className="mt-1 w-full rounded-[3px] border border-[var(--border)] bg-[var(--surface)] p-1 text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            value={value.workSurfaceHeightM}
            onChange={(e) =>
              onChange({ workSurfaceHeightM: Number(e.target.value) })
            }
          />
        </label>
        <label className="block text-sm text-[var(--foreground)]">
          Horizontal offset (m)
          <input
            type="number"
            step="0.1"
            min={0}
            className="mt-1 w-full rounded-[3px] border border-[var(--border)] bg-[var(--surface)] p-1 text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            value={value.horizontalOffsetM ?? 0}
            onChange={(e) =>
              onChange({ horizontalOffsetM: Number(e.target.value) })
            }
          />
        </label>
        <label className="block text-sm text-[var(--foreground)]">
          Worker mass (kg)
          <input
            type="number"
            step="1"
            min={0}
            className="mt-1 w-full rounded-[3px] border border-[var(--border)] bg-[var(--surface)] p-1 text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            value={value.workerMassKg}
            onChange={(e) =>
              onChange({ workerMassKg: Number(e.target.value) })
            }
          />
        </label>
      </div>
    </div>
  );
}
