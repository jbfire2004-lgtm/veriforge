"use client";

import { sfCn } from "../theme/cn";

export type ProgressStep = {
  id: string;
  label: string;
  complete?: boolean;
  current?: boolean;
};

type Props = {
  steps: ProgressStep[];
  onStepClick?: (id: string) => void;
};

export function SfProgressTracker({ steps, onStepClick }: Props) {
  const done = steps.filter((s) => s.complete).length;
  const pct = steps.length ? Math.round((done / steps.length) * 100) : 0;

  return (
    <aside className="sf-card sticky top-24 hidden p-5 lg:block">
      <p className="text-xs font-medium uppercase tracking-wider text-[var(--sf-text-muted)]">
        Progress
      </p>
      <p className="mt-1 text-2xl font-semibold text-[var(--sf-text)]">{pct}%</p>
      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--sf-surface-hover)]"
        role="progressbar"
        aria-valuenow={pct}
      >
        <span
          className="block h-full rounded-full bg-gradient-to-r from-[var(--sf-primary)] to-[var(--sf-blue-400)] transition-[width] duration-500 ease-out will-change-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ol className="mt-6 space-y-3">
        {steps.map((step, i) => (
          <li key={step.id}>
            <button
              type="button"
              className={sfCn(
                "flex w-full items-center gap-3 rounded-[var(--sf-radius-md)] px-2 py-2 text-left text-sm transition-colors",
                step.current && "bg-[var(--sf-primary-muted)]",
                onStepClick && "hover:bg-[var(--sf-surface-hover)]",
              )}
              onClick={() => onStepClick?.(step.id)}
            >
              <span
                className={sfCn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all",
                  step.complete
                    ? "bg-[var(--sf-success)] text-white"
                    : step.current
                      ? "bg-[var(--sf-primary)] text-white ring-4 ring-[var(--sf-primary-muted)]"
                      : "bg-[var(--sf-surface-hover)] text-[var(--sf-text-muted)]",
                )}
              >
                {step.complete ? "✓" : i + 1}
              </span>
              <span
                className={sfCn(
                  step.complete
                    ? "text-[var(--sf-text-muted)] line-through"
                    : "text-[var(--sf-text)]",
                )}
              >
                {step.label}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </aside>
  );
}
