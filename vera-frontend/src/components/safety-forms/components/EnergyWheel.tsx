"use client";

import { useState } from "react";
import { sfCn } from "../theme/cn";

const ENERGY = [
  { id: "electrical", label: "Electrical", color: "#eab308" },
  { id: "mechanical", label: "Mechanical", color: "#64748b" },
  { id: "gravity", label: "Gravity", color: "#8b5cf6" },
  { id: "motion", label: "Motion", color: "#2F85CC" },
  { id: "pressure", label: "Pressure", color: "#f97316" },
  { id: "chemical", label: "Chemical", color: "#3AA39F" },
  { id: "thermal", label: "Thermal", color: "#ef4444" },
  { id: "radiation", label: "Radiation", color: "#a855f7" },
];

type Props = {
  label: string;
  value?: string[];
  onChange: (types: string[]) => void;
  disabled?: boolean;
};

export function EnergyWheel({ label, value = [], onChange, disabled }: Props) {
  const [hover, setHover] = useState<string | null>(null);

  function toggle(id: string) {
    if (disabled) return;
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  }

  const n = ENERGY.length;
  const cx = 100;
  const cy = 100;
  const r = 72;

  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="text-sm font-medium text-[var(--sf-text)]">{label}</legend>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <svg
          viewBox="0 0 200 200"
          className="h-48 w-48 shrink-0 drop-shadow-[var(--sf-shadow-md)]"
          role="img"
          aria-label="Energy wheel"
        >
          {ENERGY.map((e, i) => {
            const a0 = (i / n) * 2 * Math.PI - Math.PI / 2;
            const a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
            const x0 = cx + r * Math.cos(a0);
            const y0 = cy + r * Math.sin(a0);
            const x1 = cx + r * Math.cos(a1);
            const y1 = cy + r * Math.sin(a1);
            const selected = value.includes(e.id);
            const active = hover === e.id;
            return (
              <path
                key={e.id}
                d={`M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1} Z`}
                fill={e.color}
                fillOpacity={selected ? 0.85 : active ? 0.55 : 0.35}
                stroke={selected ? "var(--sf-primary)" : "var(--sf-border)"}
                strokeWidth={selected ? 2.5 : 1}
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
        <ul className="grid flex-1 grid-cols-2 gap-2">
          {ENERGY.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => toggle(e.id)}
                className={sfCn(
                  "flex w-full items-center gap-2 rounded-[var(--sf-radius-sm)] border px-2 py-1.5 text-left text-xs transition-all",
                  value.includes(e.id)
                    ? "border-[var(--sf-primary)] bg-[var(--sf-primary-muted)] font-medium"
                    : "border-[var(--sf-border)] hover:bg-[var(--sf-surface-hover)]",
                )}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: e.color }}
                />
                {e.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </fieldset>
  );
}
