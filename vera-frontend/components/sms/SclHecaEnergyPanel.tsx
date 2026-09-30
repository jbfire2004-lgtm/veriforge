'use client';

import { useState } from 'react';
import type { EnergyControlState, SclState } from '@/lib/pm-sms-core';
import {
  SmsButton,
  SmsCard,
  SmsFormField,
  SmsSelect,
} from '@/src/components/sms/design-system';
import { sfCn } from '@/src/components/safety-forms/theme/cn';

const ENERGY_TYPES = [
  'gravity',
  'motion',
  'mechanical',
  'electrical',
  'chemical',
  'thermal',
  'pressure',
  'radiation',
  'biological',
] as const;

export type SclHecaEnergyValue = {
  sclState?: SclState;
  hecaInvolved?: boolean;
  hecaCategoryCode?: string;
  energyTypes?: string[];
  energyControlState?: EnergyControlState;
  highEnergyFlag?: boolean;
};

type Props = {
  value: SclHecaEnergyValue;
  onChange: (next: SclHecaEnergyValue) => void;
  hecaOptions?: Array<{ code: string; title: string }>;
  compact?: boolean;
};

/** SCL / HECA / Energy Wheel tagging panel — SMS design system tokens. */
export function SclHecaEnergyPanel({ value, onChange, hecaOptions = [], compact }: Props) {
  const [energyOpen, setEnergyOpen] = useState(false);

  const toggleEnergy = (type: string) => {
    const set = new Set(value.energyTypes ?? []);
    if (set.has(type)) set.delete(type);
    else set.add(type);
    onChange({ ...value, energyTypes: [...set] });
  };

  return (
    <SmsCard padding={compact ? 'sm' : 'md'} className="bg-[var(--sf-bg)]">
      <SmsFormField label="SCL state">
        <div className="flex flex-wrap gap-2">
          {(['safe', 'conditional', 'loss'] as SclState[]).map((s) => {
            const selected = value.sclState === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => onChange({ ...value, sclState: s })}
                className={sfCn(
                  'rounded-full px-3 py-1 text-sm capitalize transition-colors',
                  selected && s === 'safe' && 'bg-[var(--sf-success)] text-white',
                  selected && s === 'conditional' && 'bg-[var(--sf-warning)] text-white',
                  selected && s === 'loss' && 'bg-[var(--sf-danger)] text-white',
                  !selected &&
                    'border border-[var(--sf-border-strong)] bg-[var(--sf-surface)] text-[var(--sf-text-muted)] hover:bg-[var(--sf-surface-hover)]',
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      </SmsFormField>

      <SmsFormField label="HECA">
        <label className="flex items-center gap-2 sms-text-body">
          <input
            type="checkbox"
            checked={value.hecaInvolved ?? false}
            onChange={(e) => onChange({ ...value, hecaInvolved: e.target.checked })}
          />
          HECA involvement (critical task or equipment)
        </label>
        {value.hecaInvolved && hecaOptions.length > 0 ? (
          <SmsSelect
            className="mt-2"
            value={value.hecaCategoryCode ?? ''}
            onChange={(e) => onChange({ ...value, hecaCategoryCode: e.target.value })}
          >
            <option value="">Select HECA category</option>
            {hecaOptions.map((h) => (
              <option key={h.code} value={h.code}>
                {h.title}
              </option>
            ))}
          </SmsSelect>
        ) : null}
      </SmsFormField>

      <div>
        <SmsButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setEnergyOpen(!energyOpen)}
        >
          Energy Wheel {energyOpen ? '▾' : '▸'}
        </SmsButton>
        {energyOpen ? (
          <div className="mt-2 space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {ENERGY_TYPES.map((t) => {
                const active = value.energyTypes?.includes(t);
                return (
                  <SmsButton
                    key={t}
                    type="button"
                    size="sm"
                    variant={active ? 'primary' : 'secondary'}
                    className="capitalize"
                    onClick={() => toggleEnergy(t)}
                  >
                    {t}
                  </SmsButton>
                );
              })}
            </div>
            <SmsSelect
              value={value.energyControlState ?? ''}
              onChange={(e) =>
                onChange({
                  ...value,
                  energyControlState: (e.target.value || undefined) as EnergyControlState,
                })
              }
            >
              <option value="">Control state</option>
              <option value="controlled">Controlled</option>
              <option value="partially_controlled">Partially controlled</option>
              <option value="uncontrolled">Uncontrolled</option>
            </SmsSelect>
            <label className="flex items-center gap-2 sms-text-body">
              <input
                type="checkbox"
                checked={value.highEnergyFlag ?? false}
                onChange={(e) => onChange({ ...value, highEnergyFlag: e.target.checked })}
              />
              High-energy exposure
            </label>
          </div>
        ) : null}
      </div>
    </SmsCard>
  );
}
