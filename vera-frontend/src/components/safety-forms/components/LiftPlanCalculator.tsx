"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/src/lib/utils";

export type LiftPlanValues = {
  loadWeight?: number;
  craneCapacity?: number;
  liftRadius?: number;
};

type Props = {
  label: string;
  value?: LiftPlanValues;
  onChange: (v: LiftPlanValues) => void;
  disabled?: boolean;
};

export function LiftPlanCalculator({ label, value = {}, onChange, disabled }: Props) {
  const utilization = useMemo(() => {
    const load = value.loadWeight ?? 0;
    const cap = value.craneCapacity ?? 0;
    if (!cap) return null;
    return Math.round((load / cap) * 100);
  }, [value.loadWeight, value.craneCapacity]);

  const status =
    utilization == null
      ? "unknown"
      : utilization > 90
        ? "critical"
        : utilization > 75
          ? "warning"
          : "ok";

  function setNum(key: keyof LiftPlanValues, raw: string) {
    const n = parseFloat(raw);
    onChange({ ...value, [key]: Number.isFinite(n) ? n : undefined });
  }

  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <Label>{label}</Label>
      <section className="grid gap-3 sm:grid-cols-3">
        <article>
          <Label className="text-xs">Load (kg)</Label>
          <Input
            type="number"
            value={value.loadWeight ?? ""}
            disabled={disabled}
            onChange={(e) => setNum("loadWeight", e.target.value)}
          />
        </article>
        <article>
          <Label className="text-xs">Crane capacity (kg)</Label>
          <Input
            type="number"
            value={value.craneCapacity ?? ""}
            disabled={disabled}
            onChange={(e) => setNum("craneCapacity", e.target.value)}
          />
        </article>
        <article>
          <Label className="text-xs">Radius (m)</Label>
          <Input
            type="number"
            value={value.liftRadius ?? ""}
            disabled={disabled}
            onChange={(e) => setNum("liftRadius", e.target.value)}
          />
        </article>
      </section>
      {utilization != null ? (
        <p
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium",
            status === "ok" && "bg-green-100 text-green-900",
            status === "warning" && "bg-yellow-100 text-yellow-900",
            status === "critical" && "bg-red-100 text-red-900",
          )}
        >
          Capacity utilization: {utilization}%
          {status === "critical" ? " — review lift plan" : null}
        </p>
      ) : null}
    </fieldset>
  );
}
