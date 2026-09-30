"use client";

import Link from "next/link";
import type { CrossLinkStep } from "@/lib/veripm-ai-intelligence";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";

export function VeriPmCrossLinkChain({
  steps,
  title = "Intelligence loop",
}: {
  steps: CrossLinkStep[];
  title?: string;
}) {
  return (
    <div className="vs-panel p-4">
      <p className="vs-eyebrow">{title}</p>
      <p className="mt-1 text-xs" style={{ color: VS_COLORS.muted }}>
        Incidents → Action Management → Safety Meetings → Inspections → Training
      </p>
      <div className="mt-4 flex flex-wrap items-stretch gap-2">
        {steps.map((step, i) => (
          <div key={step.id} className="flex min-w-[140px] flex-1 items-stretch gap-2">
            <Link
              href={step.href}
              className="flex flex-1 flex-col rounded border p-3 transition-colors"
              style={{
                borderColor: step.active ? VS_COLORS.blue : VS_COLORS.border,
                background: step.active ? VS_COLORS.slate : VS_COLORS.panel,
              }}
            >
              <span
                className="text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: step.active ? VS_COLORS.blue : VS_COLORS.muted }}
              >
                {i + 1}. {step.label}
              </span>
              <span
                className="mt-1 text-sm font-medium"
                style={{ color: VS_COLORS.white }}
              >
                {step.signal}
              </span>
              <span className="mt-1 text-[11px]" style={{ color: VS_COLORS.muted }}>
                {step.nextHint}
              </span>
            </Link>
            {i < steps.length - 1 ? (
              <span
                className="hidden self-center text-lg sm:inline"
                style={{ color: VS_COLORS.blue }}
                aria-hidden
              >
                →
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
