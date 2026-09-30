"use client";

import { AiInsightPanel } from "@/components/verisuite-intelligence-ui";
import { useSmsAiBehavior } from "@/hooks/useSmsAiBehavior";
import { useSmsIntelligence } from "@/hooks/useSmsIntelligence";
import {
  SMS_AI_BEHAVIORS,
  type SmsAcceptAction,
  type SmsAiUiInsight,
  type SmsPlane,
} from "@/lib/verisuite-sms-api";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";

type SpecialistAction = {
  behaviorId: string;
  label: string;
  input?: Record<string, unknown>;
};

const PAGE_SPECIALISTS: Record<string, SpecialistAction[]> = {
  home: [
    { behaviorId: SMS_AI_BEHAVIORS.HOME, label: "Smart insights" },
    { behaviorId: SMS_AI_BEHAVIORS.BENCHMARK, label: "Industry compare" },
    { behaviorId: SMS_AI_BEHAVIORS.CROSS_PAGE, label: "Cross-page" },
  ],
  "jha-flha": [
    { behaviorId: SMS_AI_BEHAVIORS.JHA_BUILDER, label: "JHA suggest" },
    { behaviorId: SMS_AI_BEHAVIORS.FLHA_QUALITY, label: "FLHA score" },
    { behaviorId: SMS_AI_BEHAVIORS.FLHA_HAZARDS, label: "Hazard predict" },
    { behaviorId: SMS_AI_BEHAVIORS.JHA_RISK, label: "JHA risk rank" },
  ],
  emergency: [
    { behaviorId: SMS_AI_BEHAVIORS.ERP_DRAFT, label: "ERP generate" },
    { behaviorId: SMS_AI_BEHAVIORS.ERP_SIM, label: "ERP simulate" },
  ],
  inspections: [
    { behaviorId: SMS_AI_BEHAVIORS.INSPECTION_FOCUS, label: "Focus packs" },
    { behaviorId: SMS_AI_BEHAVIORS.INSPECTION_QUALITY, label: "Quality score" },
  ],
  incidents: [
    { behaviorId: SMS_AI_BEHAVIORS.INVESTIGATION, label: "Investigation" },
    { behaviorId: SMS_AI_BEHAVIORS.ROOT_CAUSE, label: "Root causes" },
  ],
  meetings: [
    { behaviorId: SMS_AI_BEHAVIORS.MEETING_TOPICS, label: "Topics" },
  ],
  actions: [
    { behaviorId: SMS_AI_BEHAVIORS.ACTION_CORRECTIVE, label: "Corrective" },
    { behaviorId: SMS_AI_BEHAVIORS.ACTION_PREVENTIVE, label: "Preventive" },
  ],
  training: [
    { behaviorId: SMS_AI_BEHAVIORS.COMPETENCY, label: "Competency forecast" },
  ],
  "sif-heca": [
    { behaviorId: SMS_AI_BEHAVIORS.JHA_RISK, label: "SIF risk rank" },
    { behaviorId: SMS_AI_BEHAVIORS.FLHA_HAZARDS, label: "Energy hazards" },
    { behaviorId: SMS_AI_BEHAVIORS.ACTION_CORRECTIVE, label: "HECA actions" },
    { behaviorId: SMS_AI_BEHAVIORS.CROSS_PAGE, label: "Cross-page" },
  ],
  predictive: [
    { behaviorId: SMS_AI_BEHAVIORS.COMPETENCY, label: "Competency forecast" },
    { behaviorId: SMS_AI_BEHAVIORS.HOME, label: "Smart insights" },
  ],
  regional: [
    { behaviorId: SMS_AI_BEHAVIORS.REGIONAL, label: "Regional AI" },
    { behaviorId: SMS_AI_BEHAVIORS.BENCHMARK, label: "Industry compare" },
  ],
};

type Props = {
  page: string;
  companyId: number;
  projectId?: number;
  plane?: SmsPlane;
  geoCode?: string;
  /** Record ids required by specialist runs */
  recordIds?: {
    flhaId?: string;
    jhaId?: string;
    erpId?: string;
    inspectionId?: string;
    incidentId?: string;
  };
  title?: string;
  fallbackInsights?: SmsAiUiInsight[];
  defaultAcceptAction?: SmsAcceptAction;
  showSpecialistBar?: boolean;
};

/**
 * Full AI integration surface: live page intelligence + specialist run bar
 * (AI-01…18) with accept/dismiss audited on the backend.
 */
export function SmsAiIntegrationPanel({
  page,
  companyId,
  projectId,
  plane = "project",
  geoCode,
  recordIds,
  title = "AI insights",
  fallbackInsights,
  defaultAcceptAction,
  showSpecialistBar = true,
}: Props) {
  const intel = useSmsIntelligence({
    page,
    companyId,
    projectId,
    plane,
    geoCode,
    fallbackInsights,
  });
  const specialist = useSmsAiBehavior({ companyId, projectId, plane });
  const actions = PAGE_SPECIALISTS[page] ?? [
    { behaviorId: SMS_AI_BEHAVIORS.CROSS_PAGE, label: "Cross-page" },
  ];

  const displayItems =
    specialist.suggestions.length > 0 ? specialist.suggestions : intel.items;

  return (
    <div className="space-y-3">
      {showSpecialistBar ? (
        <div className="flex flex-wrap gap-2">
          {actions.map((a) => (
            <button
              key={a.behaviorId}
              type="button"
              disabled={specialist.loading}
              className="rounded px-2.5 py-1 text-[11px] font-semibold"
              style={{
                border: `1px solid ${VS_COLORS.border}`,
                color: VS_COLORS.blue,
                opacity: specialist.loading ? 0.6 : 1,
              }}
              onClick={() =>
                void specialist.run(a.behaviorId, {
                  ...recordIds,
                  geoCode,
                  workType: "general",
                  scenario: "general",
                  regionCode: geoCode ?? "CA-AB",
                  sourceModule: page,
                  sourceRecordId: recordIds?.incidentId ?? `page:${page}`,
                  kind:
                    a.behaviorId === SMS_AI_BEHAVIORS.ACTION_PREVENTIVE
                      ? "preventive"
                      : a.behaviorId === SMS_AI_BEHAVIORS.ACTION_CORRECTIVE
                        ? "corrective"
                        : "both",
                  title: `AI ${a.label}`,
                  ...a.input,
                })
              }
            >
              Run {a.label}
            </button>
          ))}
          <button
            type="button"
            className="rounded px-2.5 py-1 text-[11px] font-semibold"
            style={{ border: `1px solid ${VS_COLORS.border}`, color: VS_COLORS.muted }}
            onClick={() => void intel.reload(true)}
          >
            Refresh page AI
          </button>
        </div>
      ) : null}

      {(intel.loading ||
        specialist.loading ||
        intel.error ||
        specialist.error ||
        intel.fromFallback ||
        specialist.degraded) && (
        <p className="text-[11px]" style={{ color: VS_COLORS.muted }}>
          {intel.loading || specialist.loading
            ? "Loading intelligence…"
            : specialist.error
              ? `Specialist fallback · ${specialist.error}`
              : intel.error
                ? `AI fallback · ${intel.error}`
                : specialist.degraded || intel.fromFallback
                  ? "Degraded / cached insights"
                  : null}
          {specialist.lastBehaviorId
            ? ` · last ${specialist.lastBehaviorId}`
            : ""}
        </p>
      )}

      <AiInsightPanel
        title={title}
        items={displayItems}
        busyId={intel.busyId}
        onAccept={async (item, action) => {
          await intel.accept(
            item.id,
            (action as SmsAcceptAction | undefined) ??
              defaultAcceptAction ??
              undefined,
            {
              projectId,
              ...recordIds,
            },
          );
        }}
        onDismiss={async (item) => {
          await intel.dismiss(item.id, "ui_dismiss");
        }}
      />
    </div>
  );
}
