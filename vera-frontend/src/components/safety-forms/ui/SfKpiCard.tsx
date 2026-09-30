"use client";

import type { LucideIcon } from "lucide-react";
import { sfCn } from "../theme/cn";

type Props = {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: "default" | "success" | "warning" | "danger";
  trend?: string;
};

const TONE_ICON: Record<NonNullable<Props["tone"]>, string> = {
  default: "text-[var(--sf-primary)] bg-[var(--sf-primary-muted)]",
  success: "text-emerald-600 bg-emerald-500/15",
  warning: "text-amber-600 bg-amber-500/15",
  danger: "text-red-600 bg-red-500/15",
};

export function SfKpiCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  trend,
}: Props) {
  return (
    <article
      className={sfCn(
        "sf-card group p-5 transition-transform duration-300 hover:-translate-y-0.5",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--sf-text-muted)]">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--sf-text)]">
            {value}
          </p>
          {trend ? (
            <p className="mt-1 text-xs text-[var(--sf-text-subtle)]">{trend}</p>
          ) : null}
        </div>
        {Icon ? (
          <span
            className={sfCn(
              "flex h-11 w-11 items-center justify-center rounded-[var(--sf-radius-md)] transition-transform group-hover:scale-105",
              TONE_ICON[tone],
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
    </article>
  );
}
