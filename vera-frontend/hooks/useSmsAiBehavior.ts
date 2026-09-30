"use client";

import { useCallback, useState } from "react";
import {
  runSmsAiBehavior,
  SMS_AI_BEHAVIORS,
  type SmsAiUiInsight,
  type SmsPlane,
} from "@/lib/verisuite-sms-api";

export type SmsSpecialistInput = {
  flhaId?: string;
  jhaId?: string;
  erpId?: string;
  inspectionId?: string;
  incidentId?: string;
  workType?: string;
  templateId?: string;
  scenario?: string;
  regionCode?: string;
  emsProviderIds?: string[];
  title?: string;
  sourceModule?: string;
  sourceRecordId?: string;
  kind?: "corrective" | "preventive" | "both";
  geoCode?: string;
};

/**
 * Run a single SMS AI behavior (AI-01…18) against the Nest orchestrator.
 * Used by forms/wizards; page panels use GET /intelligence.
 */
export function useSmsAiBehavior(opts: {
  companyId: number;
  projectId?: number;
  plane?: SmsPlane;
}) {
  const { companyId, projectId, plane = "project" } = opts;
  const [suggestions, setSuggestions] = useState<SmsAiUiInsight[]>([]);
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [degraded, setDegraded] = useState(false);
  const [lastBehaviorId, setLastBehaviorId] = useState<string | null>(null);

  const run = useCallback(
    async (behaviorId: string, input: SmsSpecialistInput = {}) => {
      if (!companyId) return null;
      setLoading(true);
      setError(null);
      setLastBehaviorId(behaviorId);
      try {
        const result = await runSmsAiBehavior({
          behaviorId,
          companyId,
          projectId,
          plane,
          input: {
            ...input,
            projectId,
          },
        });
        setSuggestions(result.suggestions ?? []);
        setData(result.data);
        setDegraded(!!result.degraded);
        return result;
      } catch (err) {
        setError((err as Error).message);
        setDegraded(true);
        setSuggestions([]);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [companyId, projectId, plane],
  );

  return {
    run,
    suggestions,
    data,
    loading,
    error,
    degraded,
    lastBehaviorId,
    behaviors: SMS_AI_BEHAVIORS,
  };
}
