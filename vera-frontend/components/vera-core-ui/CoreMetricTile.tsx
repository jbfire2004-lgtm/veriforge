"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { veraType } from "@/lib/vera-core-ui/typography";
import { ComplianceBadge } from "./ComplianceBadge";
import type { ComplianceState } from "@/lib/vera-core-ui/compliance";

type Props = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  compliance?: ComplianceState;
  href?: string;
  className?: string;
};

export function CoreMetricTile({
  label,
  value,
  hint,
  icon: Icon,
  compliance,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 shadow-sm",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className={veraType.caption}>{label}</p>
          <p className={veraType.metric}>{value}</p>
          {hint ? <p className={veraType.caption}>{hint}</p> : null}
        </div>
        {Icon ? (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--muted)] text-[var(--foreground)]">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
        ) : null}
      </div>
      {compliance ? (
        <div className="mt-3">
          <ComplianceBadge state={compliance} size="md" />
        </div>
      ) : null}
    </div>
  );
}
