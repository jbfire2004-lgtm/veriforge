"use client";

import { useEffect, useState } from "react";
import {
  fetchAcpAccessMe,
  fetchAcpModuleCards,
  type AcpAccessContext,
} from "@/lib/acp-api";
import type { HubModuleCard } from "@/lib/hub/hub-dashboard-api";
import { hasAcpFeature, hasAcpPermission } from "@/lib/acp-access";

export function useHubAccess(legacyRole?: string | null) {
  const [context, setContext] = useState<AcpAccessContext | null>(null);
  const [modules, setModules] = useState<HubModuleCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([
      fetchAcpAccessMe().catch(() => null),
      fetchAcpModuleCards().catch(() => []),
    ]).then(([ctx, mods]) => {
      setContext(ctx);
      setModules(mods);
      setLoading(false);
    });
  }, []);

  function canShowAdminPanel(): boolean {
    if (
      legacyRole === "SUPER_ADMIN" ||
      legacyRole === "ADMIN" ||
      legacyRole === "COMPANY_ADMIN"
    ) {
      return true;
    }
    if (!context) return false;
    if (context.isPlatformAdmin) return true;
    return (
      hasAcpPermission(context, "acp.manage") ||
      hasAcpFeature(context, "acp.enabled")
    );
  }

  function subscriptionLabel(): string | null {
    if (!context?.subscriptionTierKey) return null;
    return context.subscriptionTierKey.replace(/_/g, " ");
  }

  return {
    context,
    modules,
    loading,
    canShowAdminPanel,
    subscriptionLabel,
    hasFeature: (key: string) => hasAcpFeature(context, key),
    hasPermission: (key: string) => hasAcpPermission(context, key),
  };
}
