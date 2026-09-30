"use client";

import { cn } from "@/src/lib/utils";
import { veraType } from "@/lib/vera-core-ui/typography";
import { ComplianceBadge } from "./ComplianceBadge";
import { ComplianceRing } from "./ComplianceRing";
import type { ComplianceState } from "@/lib/vera-core-ui/compliance";

type Badge = { label: string; state?: ComplianceState };

type Props = {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  score?: number;
  compliance?: ComplianceState;
  badges?: Badge[];
  actions?: React.ReactNode;
  className?: string;
};

export function CoreHero({
  eyebrow,
  title,
  description,
  score,
  compliance = "ok",
  badges = [],
  actions,
  className,
}: Props) {
  return (
    <header
      className={cn(
        "vera-hero-bg relative overflow-hidden rounded-3xl px-6 py-8 sm:px-8 sm:py-10",
        "vera-motion-fade-up shadow-lg",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 22%, rgba(255,255,255,0.14) 0%, transparent 42%), radial-gradient(circle at 82% 68%, rgba(45,212,191,0.22) 0%, transparent 38%)",
        }}
        aria-hidden
      />
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 max-w-2xl space-y-3">
          {eyebrow ? <p className={cn(veraType.eyebrow, "text-[var(--hero-muted)]")}>{eyebrow}</p> : null}
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--hero-fg)] sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-xl text-sm leading-relaxed text-[var(--hero-muted)] sm:text-base">
              {description}
            </p>
          ) : null}
          {badges.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {badges.map((b) =>
                b.state ? (
                  <ComplianceBadge key={b.label} state={b.state} />
                ) : (
                  <span
                    key={b.label}
                    className="rounded-full bg-white/12 px-3 py-1 text-xs font-semibold text-[var(--hero-fg)]"
                  >
                    {b.label}
                  </span>
                ),
              )}
            </div>
          ) : null}
          {actions ? <div className="flex flex-wrap gap-2 pt-2">{actions}</div> : null}
        </div>
        {score != null ? (
          <div className="shrink-0 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <ComplianceRing
              value={score}
              state={compliance}
              size={104}
              label="Readiness"
            />
          </div>
        ) : null}
      </div>
    </header>
  );
}
