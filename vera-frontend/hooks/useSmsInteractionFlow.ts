"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetchJson, apiPath } from "@/lib/api-client";
import {
  flowsForPage,
  type SmsFlowStep,
  type SmsFlowSummary,
} from "@/lib/verisuite-sms-flows";
import type { SmsPlane } from "@/lib/verisuite-sms-api";

type FlowDetail = {
  id: string;
  name: string;
  entry: string;
  route: string;
  rolesSummary: string;
  aiTriggers: string[];
  success: string;
  errors: Array<{ code: string; ux: string }>;
  steps: SmsFlowStep[];
  roleVariations: Array<{
    role: string;
    variation: string;
    canWrite?: boolean;
    canApprove?: boolean;
  }>;
  dodChecks: string[];
  branches?: Array<{ id: string; name: string; steps: SmsFlowStep[] }>;
};

type Progress = {
  flowId: string;
  stepIndex: number;
  step: SmsFlowStep | null;
  complete: boolean;
  nextStep: SmsFlowStep | null;
  percent: number;
};

type Envelope<T> = { data: T };

function unwrap<T>(payload: Envelope<T> | T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as Envelope<T>).data;
  }
  return payload as T;
}

/**
 * Client for Full Interaction Flows — load catalog, advance steps, role gates.
 */
export function useSmsInteractionFlow(options: {
  page: string;
  flowId?: string;
  companyId: number;
  projectId?: number;
  plane?: SmsPlane;
  role?: string;
  enabled?: boolean;
}) {
  const {
    page,
    flowId: preferredFlowId,
    companyId,
    projectId,
    plane = "project",
    role,
    enabled = true,
  } = options;

  const pageFlows = useMemo(() => flowsForPage(page), [page]);
  const [activeFlowId, setActiveFlowId] = useState(
    preferredFlowId ?? pageFlows[0]?.id ?? "cross-page-intelligence",
  );
  const [flow, setFlow] = useState<FlowDetail | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [roleGate, setRoleGate] = useState<{
    allowed: boolean;
    variation: string;
    canWrite: boolean;
    canApprove: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const headers = useMemo(() => {
    const h: Record<string, string> = { "X-Vera-Plane": plane };
    return h;
  }, [plane]);

  const loadFlow = useCallback(
    async (id: string) => {
      if (!enabled || !companyId) return;
      setLoading(true);
      setError(null);
      try {
        const q = new URLSearchParams({ companyId: String(companyId) });
        if (projectId != null) q.set("projectId", String(projectId));
        if (role) q.set("role", role);
        const raw = await apiFetchJson<
          Envelope<{ flow: FlowDetail; roleGate?: typeof roleGate }>
        >(apiPath(`/api/v1/sms/flows/${id}?${q}`), { headers });
        const data = unwrap(raw);
        setFlow(data.flow);
        setRoleGate(data.roleGate ?? null);
        const progRaw = await apiFetchJson<Envelope<Progress>>(
          apiPath(`/api/v1/sms/flows/${id}/progress?${q}`),
          {
            method: "POST",
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify({ action: "start" }),
          },
        );
        setProgress(unwrap(progRaw));
      } catch (err) {
        setError((err as Error).message);
        setFlow(null);
      } finally {
        setLoading(false);
      }
    },
    [enabled, companyId, projectId, role, headers],
  );

  useEffect(() => {
    setActiveFlowId(preferredFlowId ?? pageFlows[0]?.id ?? activeFlowId);
  }, [preferredFlowId, pageFlows]);

  useEffect(() => {
    void loadFlow(activeFlowId);
  }, [activeFlowId, loadFlow]);

  const advance = useCallback(async () => {
    if (!progress || progress.complete) return;
    const q = new URLSearchParams({ companyId: String(companyId) });
    if (projectId != null) q.set("projectId", String(projectId));
    const raw = await apiFetchJson<Envelope<Progress>>(
      apiPath(`/api/v1/sms/flows/${activeFlowId}/progress?${q}`),
      {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "advance",
          stepIndex: progress.stepIndex,
        }),
      },
    );
    setProgress(unwrap(raw));
  }, [progress, companyId, projectId, activeFlowId, headers]);

  const selectFlow = useCallback((id: string) => {
    setActiveFlowId(id);
  }, []);

  return {
    pageFlows: pageFlows as SmsFlowSummary[],
    activeFlowId,
    selectFlow,
    flow,
    progress,
    roleGate,
    loading,
    error,
    advance,
    reload: () => loadFlow(activeFlowId),
  };
}
