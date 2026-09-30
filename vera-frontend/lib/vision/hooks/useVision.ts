"use client";

import { useCallback, useState } from "react";
import type { VisionAnalysisResult, VisionDashboardBundle } from "@vera/vision";
import { analyzeDocument, fetchVisionDashboard, type AnalyzeDocumentRequest } from "../api";

export function useVisionAnalysis() {
  const [result, setResult] = useState<VisionAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (req: AnalyzeDocumentRequest) => {
    setLoading(true);
    setError(null);
    try {
      const r = await analyzeDocument(req);
      setResult(r);
      return r;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Vision analysis failed";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { result, loading, error, analyze };
}

export function useVisionDashboard(companyId?: number) {
  const [dashboard, setDashboard] = useState<VisionDashboardBundle | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const d = await fetchVisionDashboard(companyId);
      setDashboard(d);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  return { dashboard, loading, refresh };
}
