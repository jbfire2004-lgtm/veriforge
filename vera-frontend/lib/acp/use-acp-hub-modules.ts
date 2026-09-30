"use client";

import { useEffect, useState } from "react";
import { fetchAcpHubModules } from "@/lib/acp-api";
import { hrefToHubModuleId } from "@/lib/acp-access";
import { useVeraAuthOrHook } from "@/contexts/VeraAuthContext";

export function useAcpHubModules() {
  const { tokenReady, authLoading } = useVeraAuthOrHook();
  const [allowed, setAllowed] = useState<Map<string, boolean> | null>(null);

  useEffect(() => {
    if (authLoading || !tokenReady) return;

    let cancelled = false;
    void fetchAcpHubModules()
      .then((rows) => {
        if (!cancelled) {
          setAllowed(new Map(rows.map((r) => [r.moduleId, r.allowed])));
        }
      })
      .catch(() => {
        if (!cancelled) setAllowed(new Map());
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, tokenReady]);

  function isHrefAllowed(href: string): boolean {
    if (!allowed || allowed.size === 0) return true;
    const id = hrefToHubModuleId(href);
    if (!id) return true;
    return allowed.get(id) !== false;
  }

  function filterByAcp<T extends { href: string }>(items: readonly T[]): T[] {
    return items.filter((m) => isHrefAllowed(m.href));
  }

  return { allowed, isHrefAllowed, filterByAcp, loading: allowed === null };
}
