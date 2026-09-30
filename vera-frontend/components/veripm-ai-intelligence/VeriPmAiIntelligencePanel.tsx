"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type {
  AiSuggestionKind,
  VeriPmAccessPlane,
  VeriPmAiIntelligence,
  VeriPmPageContext,
} from "@/lib/veripm-ai-intelligence";
import { resolveVeriPmPlane } from "@/lib/veripm-ai-intelligence";
import {
  AiInsightPanel,
  ComparisonPanel,
  TrendPanel,
  VsSection,
} from "@/components/verisuite-intelligence-ui";
import type { ComparisonRow } from "@/components/verisuite-intelligence-ui";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";
import { useCachedAggregate } from "@/lib/verisuite-intelligence-ui/useCachedAggregate";
import { Skeleton } from "@/components/ui/skeleton";
import { VeriPmCrossLinkChain } from "./VeriPmCrossLinkChain";

const KIND_LABEL: Record<AiSuggestionKind, string> = {
  meeting_topic: "Meeting topic",
  corrective_action: "Corrective action",
  preventive_action: "Preventive action",
  investigation: "Investigation",
  inspection_focus: "Inspection focus",
  risk_forecast: "Risk forecast",
  industry_comparison: "Industry compare",
  narrative: "Narrative",
  hazard_control: "Hazard control",
  erp_scenario: "ERP scenario",
  jha_update: "JHA update",
};

const TONE: Record<string, string> = {
  neutral: VS_COLORS.muted,
  positive: VS_COLORS.emerald,
  caution: VS_COLORS.orange,
  alert: VS_COLORS.critical,
  info: VS_COLORS.blue,
};

type Props = {
  page: VeriPmPageContext;
  projectId?: number;
  companyId?: number;
  plane?: VeriPmAccessPlane;
  /** Compact: chain + next steps only */
  compact?: boolean;
  showForecast?: boolean;
};

export function VeriPmAiIntelligencePanel({
  page,
  projectId = 1,
  companyId = 1,
  plane: planeProp,
  compact = false,
  showForecast = true,
}: Props) {
  const { data: session } = useSession();
  const role = session?.user?.role ?? null;
  const plane = planeProp ?? resolveVeriPmPlane(role);

  const url = useMemo(() => {
    const q = new URLSearchParams({
      page,
      plane,
      projectId: String(projectId),
      companyId: String(companyId),
    });
    if (role) q.set("role", role);
    return `/api/v1/veripm-ai-intelligence?${q}`;
  }, [page, plane, projectId, companyId, role]);

  const { data: ai, loading, error } =
    useCachedAggregate<VeriPmAiIntelligence>(url);

  const compareRows: ComparisonRow[] = useMemo(() => {
    if (!ai) return [];
    return ai.industryComparison.metrics.map((m) => ({
      label: m.label,
      left: m.entity,
      right: m.industry,
      unit: m.unit,
    }));
  }, [ai]);

  if (loading && !ai) {
    return (
      <div className="grid gap-3 lg:grid-cols-2">
        <Skeleton className="h-40 w-full rounded" />
        <Skeleton className="h-40 w-full rounded" />
      </div>
    );
  }

  if (error || !ai) {
    return error ? (
      <p className="text-sm" style={{ color: VS_COLORS.critical }}>
        {error}
      </p>
    ) : null;
  }

  const forecastSeries = ai.riskForecast.map((p) => ({
    period: p.period,
    value: p.value,
  }));

  return (
    <div className="space-y-4">
      <VsSection band="narrative" label="AI intelligence">
        <div
          className="vs-panel mb-4 p-4"
          style={{ borderLeft: `3px solid ${VS_COLORS.blue}` }}
        >
          <p className="vs-eyebrow">Narrative summary · {ai.scopeLabel}</p>
          <h3
            className="mt-1 text-base font-semibold"
            style={{ color: VS_COLORS.white }}
          >
            {ai.narrative.headline}
          </h3>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: VS_COLORS.muted }}>
            {ai.narrative.body}
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-wide" style={{ color: VS_COLORS.muted }}>
            Confidence {Math.round(ai.narrative.confidence * 100)}% · rev {ai.revision}
          </p>
        </div>

        <VeriPmCrossLinkChain
          steps={ai.chain}
          title={
            ai.chains.find((c) => c.steps === ai.chain)?.title ??
            ai.chains[0]?.title ??
            "Intelligence loop"
          }
        />

        {ai.chains.length > 1 ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {ai.chains.map((c) => (
              <div
                key={c.id}
                className="vs-panel p-3"
                style={{
                  borderColor: VS_COLORS.border,
                  opacity: c.steps === ai.chain ? 1 : 0.85,
                }}
              >
                <p
                  className="text-[10px] font-semibold uppercase"
                  style={{ color: VS_COLORS.blue }}
                >
                  {c.id.replace(/-/g, " ")}
                </p>
                <p className="mt-1 text-xs font-medium" style={{ color: VS_COLORS.white }}>
                  {c.title}
                </p>
                <p className="mt-1 text-[11px]" style={{ color: VS_COLORS.muted }}>
                  {c.description}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </VsSection>

      <VsSection band="detail" label="Clear next steps">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {ai.nextSteps.map((step, i) => (
            <Link
              key={step.id}
              href={step.href}
              className="vs-panel block p-3 transition-transform hover:-translate-y-0.5"
              style={{
                borderTop: `2px solid ${i === 0 ? VS_COLORS.blue : VS_COLORS.border}`,
              }}
            >
              <p
                className="text-[10px] font-semibold uppercase"
                style={{ color: VS_COLORS.blue }}
              >
                Next {i + 1}
              </p>
              <p className="mt-1 text-sm font-medium" style={{ color: VS_COLORS.white }}>
                {step.label}
              </p>
              <p className="mt-1 text-xs" style={{ color: VS_COLORS.muted }}>
                {step.reason}
              </p>
            </Link>
          ))}
        </div>
      </VsSection>

      {!compact ? (
        <>
          <VsSection band="detail" label="AI suggestions">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {ai.suggestions.slice(0, 9).map((s) => (
                <Link
                  key={s.id}
                  href={s.href}
                  className="vs-panel block p-4"
                  style={{ borderLeft: `3px solid ${TONE[s.tone] ?? VS_COLORS.blue}` }}
                >
                  <p
                    className="text-[10px] font-semibold uppercase tracking-wide"
                    style={{ color: VS_COLORS.muted }}
                  >
                    {KIND_LABEL[s.kind]} · {Math.round(s.confidence * 100)}%
                  </p>
                  <p
                    className="mt-1 text-sm font-semibold"
                    style={{ color: VS_COLORS.white }}
                  >
                    {s.title}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed" style={{ color: VS_COLORS.muted }}>
                    {s.detail}
                  </p>
                  <p className="mt-2 text-xs font-semibold" style={{ color: VS_COLORS.blue }}>
                    Take action →
                  </p>
                </Link>
              ))}
            </div>
          </VsSection>

          <div className="grid gap-4 lg:grid-cols-2">
            <ComparisonPanel
              mode={
                ai.plane === "company"
                  ? "company-vs-industry"
                  : "project-vs-industry"
              }
              title="Industry comparison"
              rows={compareRows}
            />
            <AiInsightPanel title="Insights" items={ai.insights} />
          </div>

          {showForecast ? (
            <VsSection band="trend" label="Risk forecast">
              <TrendPanel
                title="Forecast incident rate /200k (next 6 mo)"
                series={forecastSeries}
                rangeLabel="Forward look"
              />
              <div
                className="vs-panel p-4 text-sm"
                style={{ color: VS_COLORS.muted }}
              >
                <p className="vs-eyebrow">Forecast bands</p>
                <ul className="mt-2 space-y-1 text-xs">
                  {ai.riskForecast.slice(0, 3).map((p) => (
                    <li key={p.period} className="flex justify-between gap-2">
                      <span>{p.period}</span>
                      <span className="tabular-nums" style={{ color: VS_COLORS.white }}>
                        {p.bandLow.toFixed(2)} – {p.value.toFixed(2)} –{" "}
                        {p.bandHigh.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </VsSection>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
