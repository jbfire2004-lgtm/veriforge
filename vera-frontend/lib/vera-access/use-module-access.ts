"use client";

import { useEffect, useState } from "react";
import { checkAcpAccess } from "@/lib/acp-api";
import { useVeraAuthOrHook } from "@/contexts/VeraAuthContext";

export type ModuleAccessState = {
  allowed: boolean;
  loading: boolean;
  reason?: string;
};

/** Client-side module gate (Hub / Core / PM). */
export function useModuleAccess(moduleId: string): ModuleAccessState {
  const { tokenReady, authLoading, authenticated, sessionExpired } = useVeraAuthOrHook();
  const [state, setState] = useState<ModuleAccessState>({
    allowed: true,
    loading: true,
  });

  useEffect(() => {
    if (authLoading) {
      setState({ allowed: true, loading: true });
      return;
    }
    // Do not leave module UIs stuck in "Checking access…" when auth settled
    // but no client token is available yet (or session expired).
    if (!authenticated || sessionExpired || !tokenReady) {
      setState({ allowed: true, loading: false });
      return;
    }

    let cancelled = false;
    void checkAcpAccess({ module: moduleId })
      .then((r) => {
        if (!cancelled) {
          setState({ allowed: r.allowed, loading: false, reason: r.reason });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ allowed: true, loading: false });
      });
    return () => {
      cancelled = true;
    };
  }, [moduleId, authLoading, authenticated, sessionExpired, tokenReady]);

  return state;
}
