"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  label: string;
  value?: number | string;
  displayName?: string;
  onChange: (equipmentId: number | undefined) => void;
  disabled?: boolean;
  required?: boolean;
};

export function EquipmentSelector({
  label,
  value,
  displayName,
  onChange,
  disabled,
  required,
}: Props) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </Label>
      <Input
        type="number"
        disabled={disabled}
        placeholder="Equipment ID"
        value={value ?? ""}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          onChange(Number.isFinite(n) ? n : undefined);
        }}
      />
      {displayName ? (
        <p className="text-xs text-[var(--muted-foreground)]">{displayName}</p>
      ) : null}
    </div>
  );
}
