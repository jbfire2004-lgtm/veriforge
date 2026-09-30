/**
 * TRPC-style client hooks for VeriForge consoles.
 * Today these wrap Next `/api/*` fetch helpers; swap for `@trpc/react-query`
 * once the Nest AppRouter is wired in the browser.
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createOrganization,
  createOrgRole,
  createOrgUser,
  getOrganization,
  getVeriHubSession,
  listOrgModules,
  listOrgRoles,
  listOrgUsers,
  updateOrgModules,
} from "@/lib/verihub-org-api";
import {
  getSubscriptionBilling,
  getSubscriptionModules,
  updateSubscriptionBilling,
  updateSubscriptionModules,
  type BillingView,
  type ModulesView,
} from "@/lib/subscription-api";
import {
  getOrgCompliance,
  reviewComplianceArtifact,
  uploadComplianceArtifact,
  type ComplianceArtifact,
} from "@/lib/compliance-api";
import {
  getSafetyScorecard,
  recalculateSafetyScorecard,
  type ScorecardView,
} from "@/lib/scorecard-api";
import {
  awardContractor,
  getContractorCompliance,
  getContractorScorecard,
  getHiringClientSession,
  hiringClientLogin,
  listContractors,
} from "@/lib/hiring-client-api";
import {
  developerApi,
  developerLogin,
  getDeveloperSession,
} from "@/lib/developer-api";

function useAsyncResource<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await loader());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, error, loading, reload, setData };
}

/** Mirrors `trpc.org.*` / `trpc.modules.*` / `trpc.billing.*` */
export function useVeriHubOrg() {
  const orgId = getVeriHubSession()?.orgId;
  const org = useAsyncResource(() => getOrganization(), [orgId]);
  return { orgId, ...org, createOrganization };
}

export function useOrgUsers() {
  return useAsyncResource(async () => {
    const data = await listOrgUsers();
    const list = Array.isArray(data)
      ? data
      : ((data as { items?: unknown[]; users?: unknown[] }).items ??
        (data as { users?: unknown[] }).users ??
        []);
    return list as { id: string; email: string; fullName: string; status: string }[];
  }, [getVeriHubSession()?.orgId]);
}

export function useOrgRoles() {
  return useAsyncResource(async () => {
    const data = await listOrgRoles();
    return (data.roles ?? []) as {
      id: string;
      name: string;
      description?: string | null;
      systemCode?: string | null;
      _count?: { users: number };
    }[];
  }, [getVeriHubSession()?.orgId]);
}

export function useOrgModulesLegacy() {
  return useAsyncResource(async () => {
    const data = await listOrgModules();
    return (data.modules ?? []) as {
      enabled: boolean;
      module: { code: string; name: string };
    }[];
  }, [getVeriHubSession()?.orgId]);
}

export function useSubscriptionModules() {
  return useAsyncResource(() => getSubscriptionModules(), [
    getVeriHubSession()?.orgId,
  ]);
}

export function useSubscriptionBilling() {
  return useAsyncResource(() => getSubscriptionBilling(), [
    getVeriHubSession()?.orgId,
  ]);
}

export function useCompliance(orgId?: string) {
  const id = orgId ?? getVeriHubSession()?.orgId;
  return useAsyncResource(
    async () => {
      if (!id) throw new Error("Organization required");
      return getOrgCompliance(id);
    },
    [id],
  );
}

export function useScorecard(orgId?: string) {
  const id = orgId ?? getVeriHubSession()?.orgId;
  return useAsyncResource(
    async () => {
      if (!id) throw new Error("Organization required");
      return getSafetyScorecard(id);
    },
    [id],
  );
}

export function useContractors() {
  return useAsyncResource(async () => {
    if (!getHiringClientSession()) throw new Error("Hiring client session required");
    const data = await listContractors();
    return data.items ?? [];
  }, [getHiringClientSession()?.accessToken]);
}

export function useDeveloperDashboard() {
  return useAsyncResource(async () => {
    if (!getDeveloperSession()) throw new Error("Developer session required");
    return developerApi.dashboard();
  }, [getDeveloperSession()?.accessToken]);
}

export const veriforgeMutations = {
  createUser: createOrgUser,
  createRole: createOrgRole,
  updateOrgModules,
  updateSubscriptionModules,
  updateSubscriptionBilling,
  uploadComplianceArtifact,
  reviewComplianceArtifact,
  recalculateSafetyScorecard,
  awardContractor,
  getContractorScorecard,
  getContractorCompliance,
  hiringClientLogin,
  developerLogin,
  developerApi,
};

export type { ModulesView, BillingView, ScorecardView, ComplianceArtifact };
