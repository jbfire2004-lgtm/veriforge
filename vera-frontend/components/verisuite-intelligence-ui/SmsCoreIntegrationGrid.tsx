"use client";

import Link from "next/link";
import type { SmsCoreIntegration } from "@/lib/sms-core-integrations";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";

type Props = {
  title?: string;
  description?: string;
  items: SmsCoreIntegration[];
};

/**
 * Cross-module federation rail — SMS Core design template (VS panel cards).
 */
export function SmsCoreIntegrationGrid({
  title = "SMS Core federation",
  description = "Projects, FieldOS, Emergency / ERP, SIF/HECA, and Safety Hub share scope and signals with SMS Core.",
  items,
}: Props) {
  return (
    <div className="space-y-3">
      <div>
        <p className="vs-eyebrow">{title}</p>
        {description ? (
          <p className="mt-1 text-xs" style={{ color: VS_COLORS.muted }}>
            {description}
          </p>
        ) : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {items.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.id}
              href={card.href}
              className="vs-panel vs-panel-interactive block p-4 transition-transform hover:-translate-y-0.5"
              style={{ borderLeft: `3px solid ${VS_COLORS.blue}` }}
            >
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded"
                style={{
                  border: `1px solid ${VS_COLORS.border}`,
                  background: VS_COLORS.panel,
                  color: VS_COLORS.blue,
                }}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <p
                className="mt-3 text-[11px] font-semibold uppercase tracking-[0.08em]"
                style={{ color: VS_COLORS.muted }}
              >
                {card.label}
              </p>
              <p
                className="mt-1 text-sm font-medium"
                style={{ color: VS_COLORS.white }}
              >
                {card.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
