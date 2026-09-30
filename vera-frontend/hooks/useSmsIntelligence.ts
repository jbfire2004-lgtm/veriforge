"use client";

import { useCallback, useEffect, useState } from "react";
import {
  acceptSmsInsight,
  dismissSmsInsight,
  fetchSmsIntelligence,
  type SmsAcceptAction,
  type SmsAiUiInsight,
  type SmsIntelligenceBundle,
  type SmsPlane,
} from "@/lib/verisuite-sms-api";

type Options = {
  page: string;
  companyId: number;
  projectId?: number;
  plane?: SmsPlane;
  geoCode?: string;
  enabled?: boolean;
  /** Demo insights used when API fails or is unavailable */
  fallbackInsights?: SmsAiUiInsight[];
};

/**
 * Live SMS AI bundle (AI-01…18) with accept/dismiss → backend audit trail.
 */
export function useSmsIntelligence(options: Options) {
  const {
    page,
    companyId,
    projectId,
    plane = "project",
    geoCode,
    enabled = true,
    fallbackInsights = [],
  } = options;

  const [bundle, setBundle] = useState<SmsIntelligenceBundle | null>(null);
  const [items, setItems] = useState<SmsAiUiInsight[]>(fallbackInsights);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromFallback, setFromFallback] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const reload = useCallback(
    async (bust = false) => {
      if (!enabled || !companyId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSmsIntelligence({
          page,
          companyId,
          projectId,
          plane,
          geoCode,
          bustCache: bust,
        });
        setBundle(data);
        setItems(data.suggestions?.length ? data.suggestions : data.insights);
        setFromFallback(!!data.fallbackUsed);
      } catch (err) {
        setError((err as Error).message);
        setFromFallback(true);
        if (fallbackInsights.length) setItems(fallbackInsights);
      } finally {
        setLoading(false);
      }
    },
    [
      enabled,
      companyId,
      projectId,
      plane,
      page,
      geoCode,
      fallbackInsights,
    ],
  );

  useEffect(() => {
    void reload();
  }, [reload]);

  const accept = useCallback(
    async (
      suggestionId: string,
      action?: SmsAcceptAction,
      payload?: Record<string, unknown>,
    ) => {
      setBusyId(suggestionId);
      try {
        const result = await acceptSmsInsight({
          suggestionId,
          action,
          payload: {
            projectId,
            ...payload,
          },
          companyId,
          projectId,
          plane,
        });
        setItems((prev) => prev.filter((i) => i.id !== suggestionId));
        return result;
      } finally {
        setBusyId(null);
      }
    },
    [companyId, projectId, plane],
  );

  const dismiss = useCallback(
    async (suggestionId: string, reason?: string) => {
      setBusyId(suggestionId);
      try {
        await dismissSmsInsight({
          suggestionId,
          reason,
          companyId,
          projectId,
          plane,
        });
        setItems((prev) => prev.filter((i) => i.id !== suggestionId));
      } finally {
        setBusyId(null);
      }
    },
    [companyId, projectId, plane],
  );

  return {
    bundle,
    items,
    chips: bundle?.chips ?? [],
    loading,
    error,
    fromFallback,
    busyId,
    reload,
    accept,
    dismiss,
  };
}
