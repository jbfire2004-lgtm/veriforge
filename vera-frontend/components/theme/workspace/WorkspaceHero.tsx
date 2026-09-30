import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";
import {
  WORKSPACE_GRID_OVERLAY,
  WORKSPACE_RADIAL_OVERLAY,
  WORKSPACE,
} from "./workspace-theme";

export type WorkspaceHeroBadge = {
  label: string;
  tone?: "teal" | "amber" | "neutral";
};

type Props = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  badges?: WorkspaceHeroBadge[];
  actions?: ReactNode;
  /** Slightly greener gradient for welcome / signed-in landing */
  variant?: "default" | "welcome";
  className?: string;
  children?: ReactNode;
};

const BADGE_STYLES: Record<NonNullable<WorkspaceHeroBadge["tone"]>, string> = {
  teal: "bg-white/10 text-teal-100 ring-white/20",
  amber: "bg-amber-500/20 text-amber-100 ring-amber-400/30",
  neutral: "bg-white/10 text-white/90 ring-white/20",
};

export function WorkspaceHero({
  eyebrow,
  title,
  description,
  badges,
  actions,
  variant = "default",
  className,
  children,
}: Props) {
  return (
    <header
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[#2A2E33]/10 shadow-lg",
        variant === "welcome" ? WORKSPACE.heroGradientWelcome : WORKSPACE.heroGradient,
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={WORKSPACE_RADIAL_OVERLAY}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        aria-hidden
        style={WORKSPACE_GRID_OVERLAY}
      />
      <div className="relative z-10 space-y-4 p-8 sm:p-10">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-200/90">
            {eyebrow}
          </p>
        ) : null}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl font-bold uppercase tracking-[0.04em] text-white sm:text-4xl">
              {title}
            </h1>
            {description ? (
              <div className="text-sm leading-relaxed text-teal-50/90 sm:text-base">
                {description}
              </div>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap gap-3">{actions}</div> : null}
        </div>
        {badges && badges.length > 0 ? (
          <div className="flex flex-wrap gap-3 pt-1">
            {badges.map((b) => (
              <span
                key={b.label}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ring-1",
                  BADGE_STYLES[b.tone ?? "neutral"],
                )}
              >
                {b.tone === "teal" ? (
                  <span className="h-2 w-2 rounded-full bg-teal-300" aria-hidden />
                ) : null}
                {b.label}
              </span>
            ))}
          </div>
        ) : null}
        {children}
      </div>
    </header>
  );
}
