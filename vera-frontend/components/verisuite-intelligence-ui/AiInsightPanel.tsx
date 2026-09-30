"use client";

import { useState } from "react";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";

export type InsightItem = {
  id: string;
  tone: "neutral" | "positive" | "caution" | "alert";
  headline: string;
  body: string;
  confidence?: number;
  /** Optional deep-link shown when expanded */
  href?: string;
  hrefLabel?: string;
  behaviorId?: string;
  visibility?: "caution" | "suggest" | "rank";
  guardrails?: string[];
  degraded?: boolean;
  nextActions?: Array<{ action: string; label: string }>;
};

const toneBorder: Record<InsightItem["tone"], string> = {
  alert: VS_COLORS.critical,
  caution: VS_COLORS.orange,
  positive: VS_COLORS.emerald,
  neutral: VS_COLORS.border,
};

type Props = {
  title?: string;
  items: InsightItem[];
  /** Allow click-to-expand (default true) */
  expandable?: boolean;
  /** When set, show Accept / Dismiss (accept-before-SoR) */
  onAccept?: (
    item: InsightItem,
    action?: string,
  ) => void | Promise<void>;
  onDismiss?: (item: InsightItem) => void | Promise<void>;
  busyId?: string | null;
  footerNote?: string;
};

export function AiInsightPanel({
  title = "AI insights",
  items,
  expandable = true,
  onAccept,
  onDismiss,
  busyId,
  footerNote,
}: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="vs-panel p-4">
      <p className="vs-eyebrow">{title}</p>
      <div className="mt-3 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm" style={{ color: VS_COLORS.muted }}>
            No insights above confidence gate.
          </p>
        ) : null}
        {items.map((n) => {
          const expanded = expandable && openId === n.id;
          const busy = busyId === n.id;
          return (
            <div
              key={n.id}
              className="vs-insight-card"
              data-interactive={expandable ? "true" : undefined}
              data-expanded={expanded ? "true" : undefined}
              style={{ borderLeftColor: toneBorder[n.tone] }}
              role={expandable ? "button" : undefined}
              tabIndex={expandable ? 0 : undefined}
              onClick={
                expandable
                  ? () => setOpenId((cur) => (cur === n.id ? null : n.id))
                  : undefined
              }
              onKeyDown={
                expandable
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setOpenId((cur) => (cur === n.id ? null : n.id));
                      }
                    }
                  : undefined
              }
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p
                  className="text-sm font-semibold"
                  style={{ color: VS_COLORS.white }}
                >
                  {n.headline}
                </p>
                {n.behaviorId ? (
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                    style={{
                      color: VS_COLORS.blue,
                      border: `1px solid ${VS_COLORS.border}`,
                    }}
                  >
                    {n.behaviorId}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm" style={{ color: VS_COLORS.muted }}>
                {n.body}
              </p>
              {n.confidence != null ? (
                <p
                  className="mt-1 text-[10px] uppercase tracking-wide"
                  style={{ color: VS_COLORS.muted }}
                >
                  Confidence {Math.round(n.confidence * 100)}%
                  {n.visibility ? ` · ${n.visibility}` : ""}
                  {n.degraded ? " · degraded" : ""}
                  {expandable ? (expanded ? " · collapse" : " · expand") : ""}
                </p>
              ) : null}
              <div className="vs-insight-card-body">
                <p className="text-xs" style={{ color: VS_COLORS.muted }}>
                  {footerNote ??
                    "Evidence-backed suggestion — accept before any system write. Use ModuleNav / GlobalNav for deep links (no inline back links)."}
                </p>
                {n.guardrails?.length ? (
                  <p
                    className="mt-1 text-[10px] uppercase tracking-wide"
                    style={{ color: VS_COLORS.orange }}
                  >
                    Guardrails: {n.guardrails.join(", ")}
                  </p>
                ) : null}
                {n.href ? (
                  <a
                    href={n.href}
                    className="mt-2 inline-block text-xs font-semibold"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {n.hrefLabel ?? "Open linked module →"}
                  </a>
                ) : null}
                {(onAccept || onDismiss) && (
                  <div
                    className="mt-3 flex flex-wrap gap-2"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    {onAccept ? (
                      <button
                        type="button"
                        disabled={busy}
                        className="rounded px-2.5 py-1 text-xs font-semibold"
                        style={{
                          background: VS_COLORS.blue,
                          color: VS_COLORS.navy,
                          opacity: busy ? 0.6 : 1,
                        }}
                        onClick={() =>
                          void onAccept(
                            n,
                            n.nextActions?.find((a) => a.action !== "dismiss")
                              ?.action,
                          )
                        }
                      >
                        {busy ? "Working…" : "Accept"}
                      </button>
                    ) : null}
                    {onDismiss ? (
                      <button
                        type="button"
                        disabled={busy}
                        className="rounded px-2.5 py-1 text-xs font-semibold"
                        style={{
                          border: `1px solid ${VS_COLORS.border}`,
                          color: VS_COLORS.muted,
                          opacity: busy ? 0.6 : 1,
                        }}
                        onClick={() => void onDismiss(n)}
                      >
                        Dismiss
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
