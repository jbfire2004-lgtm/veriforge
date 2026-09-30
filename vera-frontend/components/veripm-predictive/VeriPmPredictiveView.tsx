"use client";

import { useSession } from "next-auth/react";
import {
  VsDashboardShell,
  VsSection,
} from "@/components/verisuite-intelligence-ui";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";
import { resolveVeriPmPlane } from "@/lib/veripm-ai-intelligence";
import { VeriPmAiIntelligencePanel } from "@/components/veripm-ai-intelligence";
import { SmsAiIntegrationPanel } from "@/components/verisuite-sms-ai/SmsAiIntegrationPanel";
import { SmsInteractionFlowPanel } from "@/components/verisuite-sms-ai/SmsInteractionFlowPanel";
import Link from "next/link";

export function VeriPmPredictiveView({
  projectId = 1,
  companyId = 1,
}: {
  projectId?: number;
  companyId?: number;
}) {
  const { data: session } = useSession();
  const plane = resolveVeriPmPlane(session?.user?.role ?? null);

  return (
    <VsDashboardShell
      eyebrow="VeriPM · Predictive"
      title="Predictive safety analytics"
      description="AI risk forecasts, industry benchmarks, and the Incidents → Actions → Meetings → Inspections → Training loop — scoped to your access plane."
      meta={`${plane} scope · project #${projectId}`}
    >
      <VsSection band="controls">
        <div className="flex flex-wrap gap-3 text-xs">
          <Link href="/pm/incidents" style={{ color: VS_COLORS.blue }}>
            Incidents →
          </Link>
          <Link href="/pm/action-management" style={{ color: VS_COLORS.blue }}>
            Action Management →
          </Link>
          <Link href="/pm/inspections" style={{ color: VS_COLORS.blue }}>
            Inspections →
          </Link>
          <Link href="/pm/training" style={{ color: VS_COLORS.blue }}>
            Training →
          </Link>
        </div>
      </VsSection>

      <VsSection band="narrative" label="SMS AI · predictive (AI-01 / AI-15 / AI-16)">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <SmsAiIntegrationPanel
            page="predictive"
            companyId={companyId}
            projectId={projectId}
            plane={plane === "company" ? "company" : "project"}
            title="Predictive intelligence"
            defaultAcceptAction="create_action"
          />
          <SmsInteractionFlowPanel
            page="predictive"
            companyId={companyId}
            projectId={projectId}
            plane={plane === "company" ? "company" : "project"}
            title="Dashboard & intelligence flows"
          />
        </div>
      </VsSection>

      <VeriPmAiIntelligencePanel
        page="predictive"
        projectId={projectId}
        companyId={companyId}
        plane={plane}
      />
    </VsDashboardShell>
  );
}
