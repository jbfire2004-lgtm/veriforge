"use client";

import { useCallback, useEffect, useState } from "react";
import { useVeraAuthOrHook } from "@/contexts/VeraAuthContext";
import {
  fetchControlCatalog,
  fetchHazardCatalog,
  type ControlCatalogEntry,
  type HazardCatalogEntry,
} from "@/lib/hazard-control-catalog";
import { identifyHazardsWithAi, type AiHazardIdentifyResult } from "@/lib/jha-ai-suggestions";
import { apiLoadErrorMessage } from "@/lib/network-error-message";

/** Loads Vera Core `/api/v1/hazards` and `/api/v1/controls` catalogs once auth is ready. */
export function useJhaHazardControlCatalog(companyId: number, projectId: number) {
  const { session, authLoading, authenticated, tokenReady, sessionExpired } =
    useVeraAuthOrHook();

  const [hazards, setHazards] = useState<HazardCatalogEntry[]>([]);
  const [controls, setControls] = useState<ControlCatalogEntry[]>([]);
  const [hazardCategories, setHazardCategories] = useState<string[]>([]);
  const [controlTypes, setControlTypes] = useState<string[]>([]);
  const [hazardCounts, setHazardCounts] = useState<Record<string, number>>({});
  const [controlCounts, setControlCounts] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AiHazardIdentifyResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const loadCatalog = useCallback(async () => {
    if (!tokenReady) return;
    setReady(false);
    setError(null);
    try {
      const [hazardRes, controlRes] = await Promise.all([
        fetchHazardCatalog(companyId, projectId, { session }),
        fetchControlCatalog(companyId, projectId, { session }),
      ]);
      setHazards(hazardRes.hazards);
      setHazardCategories(hazardRes.categories);
      setHazardCounts(hazardRes.counts);
      setControls(controlRes.controls);
      setControlTypes(controlRes.controlTypes);
      setControlCounts(controlRes.counts);
    } catch (e) {
      setError(apiLoadErrorMessage(e, "Could not load hazard and control library"));
    } finally {
      setReady(true);
    }
  }, [companyId, projectId, session, tokenReady]);

  useEffect(() => {
    if (authLoading || sessionExpired) return;
    if (!authenticated || !tokenReady) return;
    void loadCatalog();
  }, [authLoading, authenticated, tokenReady, sessionExpired, loadCatalog]);

  const runAiIdentify = useCallback(
    async (input: {
      taskDescription: string;
      workScope?: string;
      locationNote?: string;
      equipment?: string[];
    }) => {
      if (!input.taskDescription.trim() || !tokenReady) return null;
      setAiLoading(true);
      setAiError(null);
      try {
        const result = await identifyHazardsWithAi(
          companyId,
          projectId,
          input,
          session,
        );
        setAiResult(result);
        return result;
      } catch (e) {
        setAiError(apiLoadErrorMessage(e, "AI hazard identification failed"));
        return null;
      } finally {
        setAiLoading(false);
      }
    },
    [companyId, projectId, session, tokenReady],
  );

  return {
    hazards,
    controls,
    hazardCategories,
    controlTypes,
    hazardCounts,
    controlCounts,
    ready,
    error,
    aiLoading,
    aiResult,
    aiError,
    runAiIdentify,
    reload: loadCatalog,
    session,
    authLoading,
    authenticated,
    tokenReady,
    sessionExpired,
  };
}

/** @deprecated Use {@link useJhaHazardControlCatalog} for catalog loading. */
export const useJhaHazardControlLibrary = useJhaHazardControlCatalog;
