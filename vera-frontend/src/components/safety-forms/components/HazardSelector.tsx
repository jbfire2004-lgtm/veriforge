"use client";

import {
  AlertTriangle,
  Flame,
  CloudRain,
  Zap,
  Truck,
  Box,
  Activity,
  HardHat,
} from "lucide-react";
import { sfCn } from "../theme/cn";

const HAZARDS = [
  { id: "Slips/trips/falls", icon: Activity, color: "from-blue-500/20 to-blue-600/5 border-blue-500/40 text-blue-700" },
  { id: "Struck by", icon: HardHat, color: "from-orange-500/20 to-orange-600/5 border-orange-500/40 text-orange-800" },
  { id: "Caught in/between", icon: Box, color: "from-purple-500/20 to-purple-600/5 border-purple-500/40 text-purple-800" },
  { id: "Electrical", icon: Zap, color: "from-yellow-500/20 to-yellow-600/5 border-yellow-500/40 text-yellow-800" },
  { id: "Chemical exposure", icon: AlertTriangle, color: "from-teal-500/20 to-teal-600/5 border-teal-500/40 text-teal-800" },
  { id: "Fire/explosion", icon: Flame, color: "from-red-500/20 to-red-600/5 border-red-500/40 text-red-800" },
  { id: "Ergonomic", icon: Activity, color: "from-slate-500/20 to-slate-600/5 border-slate-500/40 text-slate-800" },
  { id: "Weather", icon: CloudRain, color: "from-sky-500/20 to-sky-600/5 border-sky-500/40 text-sky-800" },
  { id: "Traffic", icon: Truck, color: "from-indigo-500/20 to-indigo-600/5 border-indigo-500/40 text-indigo-800" },
  { id: "Confined space", icon: Box, color: "from-rose-500/20 to-rose-600/5 border-rose-500/40 text-rose-800" },
];

type Props = {
  label: string;
  value?: string[];
  onChange: (hazards: string[]) => void;
  disabled?: boolean;
  required?: boolean;
};

export function HazardSelector({ label, value = [], onChange, disabled, required }: Props) {
  function toggle(id: string) {
    if (disabled) return;
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  }

  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="text-sm font-medium text-[var(--sf-text)]">
        {label}
        {required ? <span className="text-[var(--sf-danger)]"> *</span> : null}
      </legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {HAZARDS.map((h) => {
          const selected = value.includes(h.id);
          const Icon = h.icon;
          return (
            <button
              key={h.id}
              type="button"
              title={h.id}
              onClick={() => toggle(h.id)}
              className={sfCn(
                "group flex flex-col items-center gap-2 rounded-[var(--sf-radius-md)] border bg-gradient-to-br p-3 text-center transition-all duration-200 will-change-transform",
                h.color,
                selected
                  ? "scale-[1.02] ring-2 ring-[var(--sf-primary)] shadow-[var(--sf-shadow-glow)]"
                  : "opacity-90 hover:scale-[1.02] hover:shadow-[var(--sf-shadow-md)]",
              )}
            >
              <Icon
                className={sfCn(
                  "h-6 w-6 transition-transform duration-200",
                  selected && "scale-110",
                )}
              />
              <span className="text-xs font-medium leading-tight">{h.id}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
