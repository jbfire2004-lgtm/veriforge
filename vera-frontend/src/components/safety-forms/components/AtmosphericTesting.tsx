"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type AtmosphericReading = {
  gas: string;
  reading: string;
  acceptable: boolean;
};

const DEFAULT_GASES = ["O2", "LEL", "H2S", "CO"];

type Props = {
  label: string;
  value?: AtmosphericReading[];
  onChange: (readings: AtmosphericReading[]) => void;
  disabled?: boolean;
};

export function AtmosphericTesting({ label, value, onChange, disabled }: Props) {
  const readings =
    value ??
    DEFAULT_GASES.map((gas) => ({ gas, reading: "", acceptable: false }));

  function update(i: number, patch: Partial<AtmosphericReading>) {
    onChange(readings.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <Label>{label}</Label>
      {readings.map((r, i) => (
        <div key={r.gas} className="grid grid-cols-[4rem_1fr_auto] items-center gap-2">
          <span className="text-sm font-medium">{r.gas}</span>
          <Input
            placeholder="Reading"
            value={r.reading}
            disabled={disabled}
            onChange={(e) => update(i, { reading: e.target.value })}
          />
          <label className="flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={r.acceptable}
              disabled={disabled}
              onChange={(e) => update(i, { acceptable: e.target.checked })}
            />
            OK
          </label>
        </div>
      ))}
    </fieldset>
  );
}
