"use client";

import { AiInsightPanel } from "@/components/verisuite-intelligence-ui";
import { InsightStrip } from "@/components/verisuite-intelligence-ui";
import { useSmsIntelligence } from "@/hooks/useSmsIntelligence";
import type {
  SmsAcceptAction,
  SmsAiUiInsight,
  SmsPlane,
} from "@/lib/verisuite-sms-api";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";

type Props = {
  page: string;
  companyId: number;
  projectId?: number;
  plane?: SmsPlane;
  geoCode?: string;
  title?: string;
  showStrip?: boolean;
  fallbackInsights?: SmsAiUiInsight[];
  defaultAcceptAction?: SmsAcceptAction;
  enabled?: boolean;
};

/**
 * Connected AI panel — loads `/api/v1/sms/intelligence`, accept/dismiss
 * audited on the backend, demo fallback when offline.
 */
export function SmsConnectedInsightPanel({
  page,
  companyId,
  projectId,
  plane = "project",
  geoCode,
  title = "AI insights",
  showStrip = true,
  fallbackInsights,
  defaultAcceptAction,
  enabled = true,
}: Props) {
  const {
    items,
    chips,
    loading,
    error,
    fromFallback,
    busyId,
    accept,
    dismiss,
  } = useSmsIntelligence({
    page,
    companyId,
    projectId,
    plane,
    geoCode,
    enabled,
    fallbackInsights,
  });

  return (
    <div className="space-y-3">
      {showStrip && chips.length > 0 ? (
        <InsightStrip
          chips={chips.map((c) => ({
            id: c.id,
            label: c.label,
            value: String(c.value),
            tone:
              c.tone === "alert" ||
              c.tone === "caution" ||
              c.tone === "positive" ||
              c.tone === "info"
                ? (c.tone as "alert" | "caution" | "positive" | "info")
                : "info",
            href: c.href,
          }))}
        />
      ) : null}
      {(loading || error || fromFallback) && (
        <p className="text-[11px]" style={{ color: VS_COLORS.muted }}>
          {loading
            ? "Loading intelligence…"
            : error
              ? `AI fallback · ${error}`
              : fromFallback
                ? "Degraded / cached insights"
                : null}
        </p>
      )}
      <AiInsightPanel
        title={title}
        items={items}
        busyId={busyId}
        onAccept={async (item, action) => {
          await accept(
            item.id,
            (action as SmsAcceptAction | undefined) ??
              defaultAcceptAction ??
              undefined,
            { projectId },
          );
        }}
        onDismiss={async (item) => {
          await dismiss(item.id, "ui_dismiss");
        }}
      />
    </div>
  );
}
