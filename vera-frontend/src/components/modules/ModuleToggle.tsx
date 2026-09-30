"use client";

import { Button } from "@/components/ui";
import { StatusIndicator, statusToneFromCompliance } from "@/components/ui/status-indicator";
import { cn } from "@/src/lib/utils";
import type { ProductModuleRow } from "@/lib/subscription-api";
import { formatCents } from "@/lib/subscription-api";

export function ModuleToggle({
  enabled,
  required,
  busy,
  onToggle,
}: {
  enabled: boolean;
  required?: boolean;
  busy?: boolean;
  onToggle: (next: boolean) => void;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={enabled ? "outline" : "success"}
      disabled={busy || (required && enabled)}
      onClick={() => onToggle(!enabled)}
    >
      {busy ? "…" : enabled ? (required ? "Required" : "Disable") : "Enable"}
    </Button>
  );
}

export function ModuleCard({
  module,
  busy,
  cycle = "monthly",
  onToggle,
}: {
  module: ProductModuleRow;
  busy?: boolean;
  cycle?: "monthly" | "annual";
  onToggle: (code: string, enabled: boolean) => void;
}) {
  const price =
    cycle === "annual" ? module.pricing.annualCents : module.pricing.monthlyCents;

  return (
    <article className="flex flex-col justify-between border border-zinc-200 bg-white p-4">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-medium">{module.name}</h3>
            <p className="font-mono text-xs text-zinc-500">{module.code}</p>
          </div>
          <StatusIndicator
            label={module.enabled ? "Enabled" : "Disabled"}
            tone={module.enabled ? "success" : "neutral"}
          />
        </div>
        <p className="text-sm text-zinc-600">{module.description}</p>
        <p className="text-sm text-zinc-700">
          {module.required
            ? "Included"
            : `${formatCents(price)}/${cycle === "annual" ? "yr" : "mo"}`}
        </p>
        <p className="text-xs text-zinc-500">
          Usage: {module.usage.value.toLocaleString()}{" "}
          {module.usage.metric.replace(/_/g, " ")}
        </p>
      </div>
      <div className="mt-4">
        <ModuleToggle
          enabled={module.enabled}
          required={module.required}
          busy={busy}
          onToggle={(next) => onToggle(module.code, next)}
        />
      </div>
    </article>
  );
}

export function ModuleGrid({
  modules,
  busyCode,
  cycle = "monthly",
  onToggle,
  className,
}: {
  modules: ProductModuleRow[];
  busyCode?: string | null;
  cycle?: "monthly" | "annual";
  onToggle: (code: string, enabled: boolean) => void;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {modules.map((m) => (
        <ModuleCard
          key={m.code}
          module={m}
          cycle={cycle}
          busy={busyCode === m.code}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
