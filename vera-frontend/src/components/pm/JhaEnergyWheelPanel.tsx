"use client";

import { useMemo, useState } from "react";
import { sfCn } from "@/src/components/safety-forms/theme/cn";
import {
  analyzeJhaEnergies,
  JHA_ENERGY_TYPES,
  type ControlEnergyInput,
  type HazardEnergyInput,
} from "./jha-energy-analysis";

type Props = {
  hazards: HazardEnergyInput[];
  controls: ControlEnergyInput[];
  controlLibrary: Array<Record<string, unknown>>;
  value: string[];
  onChange: (types: string[]) => void;
  disabled?: boolean;
  /** FLHA: summary wheel only — no breakdown table */
  compact?: boolean;
};

export function JhaEnergyWheelPanel({
  hazards,
  controls,
  controlLibrary,
  value,
  onChange,
  disabled,
  compact = false,
}: Props) {
  const [hover, setHover] = useState<string | null>(null);

  const analysis = useMemo(
    () => analyzeJhaEnergies(hazards, controls, controlLibrary, value),
    [hazards, controls, controlLibrary, value],
  );

  const analysisById = useMemo(
    () => new Map(analysis.map((a) => [a.id, a])),
    [analysis],
  );

  const gapCount = analysis.filter((a) => a.hasGap && value.includes(a.id)).length;

  function toggle(id: string) {
    if (disabled) return;
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  }

  const n = JHA_ENERGY_TYPES.length;
  const cx = 100;
  const cy = 100;
  const r = 72;

  return (
    <fieldset className="space-y-4" disabled={disabled}>
      <div>
        <legend className="text-sm font-medium text-[var(--sf-text)]">
          {compact ? "Energy types (from hazards & controls)" : "4. Energy wheel"}
        </legend>
        <p className="mt-1 text-xs text-[var(--sf-text-muted)]">
          {compact
            ? "Auto-filled from hazards and controls identified above."
            : "Energies are inferred from identified hazards and selected controls. Segments with hazards but no matching controls are flagged. You can add or remove energies manually if needed."}
        </p>
      </div>

      {hazards.length === 0 ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Add hazards in step 2 — energy types will populate automatically from hazard profiles.
        </p>
      ) : null}

      <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start">
        <svg
          viewBox="0 0 200 200"
          className="h-52 w-52 shrink-0 drop-shadow-[var(--sf-shadow-md)]"
          role="img"
          aria-label="Energy wheel"
        >
          {JHA_ENERGY_TYPES.map((e, i) => {
            const a0 = (i / n) * 2 * Math.PI - Math.PI / 2;
            const a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
            const x0 = cx + r * Math.cos(a0);
            const y0 = cy + r * Math.sin(a0);
            const x1 = cx + r * Math.cos(a1);
            const y1 = cy + r * Math.sin(a1);
            const selected = value.includes(e.id);
            const active = hover === e.id;
            const seg = analysisById.get(e.id);
            const hasGap = seg?.hasGap && selected;
            const linked = (seg?.hazards.length ?? 0) + (seg?.controls.length ?? 0) > 0;

            return (
              <path
                key={e.id}
                d={`M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1} Z`}
                fill={e.color}
                fillOpacity={
                  selected ? (hasGap ? 0.95 : 0.85) : linked ? 0.5 : active ? 0.4 : 0.2
                }
                stroke={
                  hasGap
                    ? "#B33A3A"
                    : selected
                      ? "var(--sf-primary)"
                      : linked
                        ? "#64748b"
                        : "var(--sf-border)"
                }
                strokeWidth={hasGap ? 3 : selected ? 2.5 : linked ? 1.5 : 1}
                strokeDasharray={linked && !selected ? "4 2" : undefined}
                className="cursor-pointer transition-all duration-200"
                onClick={() => toggle(e.id)}
                onMouseEnter={() => setHover(e.id)}
                onMouseLeave={() => setHover(null)}
              />
            );
          })}
          <circle cx={cx} cy={cy} r={28} fill="var(--sf-surface)" stroke="var(--sf-border)" />
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-[var(--sf-text-muted)] text-[8px] font-medium"
          >
            ENERGY
          </text>
        </svg>

        <div className="min-w-0 flex-1 space-y-3">
          {gapCount > 0 ? (
            <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-900">
              {gapCount} energy {gapCount === 1 ? "type has" : "types have"} identified hazards with
              no linked controls — add controls that address {gapCount === 1 ? "this energy" : "these energies"}.
            </p>
          ) : value.length > 0 && hazards.length > 0 ? (
            <p className="rounded border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-900">
              All active hazard energies have at least one linked control.
            </p>
          ) : null}

          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {JHA_ENERGY_TYPES.map((e) => {
              const seg = analysisById.get(e.id);
              const linked = (seg?.hazards.length ?? 0) + (seg?.controls.length ?? 0) > 0;
              if (!linked && !value.includes(e.id)) return null;
              return (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => toggle(e.id)}
                    className={sfCn(
                      "flex w-full flex-col gap-1 rounded-[var(--sf-radius-sm)] border px-2.5 py-2 text-left text-xs transition-all",
                      value.includes(e.id)
                        ? seg?.hasGap
                          ? "border-red-400 bg-red-50 font-medium"
                          : "border-[var(--sf-primary)] bg-[var(--sf-primary-muted)] font-medium"
                        : "border-[var(--sf-border)] hover:bg-[var(--sf-surface-hover)]",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: e.color }}
                      />
                      {e.label}
                      {seg?.hasGap && value.includes(e.id) ? (
                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-red-800">
                          Gap
                        </span>
                      ) : null}
                    </span>
                    {seg && (seg.hazards.length > 0 || seg.controls.length > 0) ? (
                      <span className="text-[10px] leading-snug text-[var(--sf-text-muted)]">
                        {seg.hazards.length > 0
                          ? `${seg.hazards.length} hazard${seg.hazards.length > 1 ? "s" : ""}`
                          : ""}
                        {seg.hazards.length > 0 && seg.controls.length > 0 ? " · " : ""}
                        {seg.controls.length > 0
                          ? `${seg.controls.length} control${seg.controls.length > 1 ? "s" : ""}`
                          : ""}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {analysis.some((a) => a.hazards.length > 0 || a.controls.length > 0) && !compact ? (
        <div className="overflow-hidden rounded-lg border border-[var(--sf-border)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--sf-surface-muted)] text-left text-xs uppercase tracking-wide text-[var(--sf-text-muted)]">
              <tr>
                <th className="px-3 py-2 font-medium">Energy</th>
                <th className="px-3 py-2 font-medium">From hazards</th>
                <th className="px-3 py-2 font-medium">Mitigated by controls</th>
                <th className="px-3 py-2 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--sf-border)]">
              {analysis
                .filter((a) => a.hazards.length > 0 || a.controls.length > 0 || value.includes(a.id))
                .map((a) => (
                  <tr key={a.id} className="bg-[var(--sf-surface)]">
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: a.color }}
                        />
                        {a.label}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-[var(--sf-text-muted)]">
                      {a.hazards.length > 0 ? (
                        <ul className="list-disc pl-4">
                          {a.hazards.slice(0, 3).map((h) => (
                            <li key={h}>{h.length > 60 ? `${h.slice(0, 60)}…` : h}</li>
                          ))}
                          {a.hazards.length > 3 ? (
                            <li className="list-none pl-0 italic">+{a.hazards.length - 3} more</li>
                          ) : null}
                        </ul>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs text-[var(--sf-text-muted)]">
                      {a.controls.length > 0 ? (
                        <ul className="list-disc pl-4">
                          {a.controls.slice(0, 3).map((c) => (
                            <li key={c}>{c.length > 60 ? `${c.slice(0, 60)}…` : c}</li>
                          ))}
                          {a.controls.length > 3 ? (
                            <li className="list-none pl-0 italic">+{a.controls.length - 3} more</li>
                          ) : null}
                        </ul>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {!value.includes(a.id) ? (
                        <span className="text-[var(--sf-text-muted)]">Not active</span>
                      ) : a.hasGap ? (
                        <span className="font-medium text-red-700">Control gap</span>
                      ) : a.controls.length > 0 ? (
                        <span className="text-green-700">Mitigated</span>
                      ) : (
                        <span className="text-amber-700">Manual</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </fieldset>
  );
}
