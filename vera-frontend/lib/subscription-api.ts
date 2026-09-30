/**
 * Subscription engine client → Next `/api/modules/*` & `/api/billing/*` → SaaS.
 */

import { getVeriHubSession } from "./verihub-org-api";

export type ProductModuleRow = {
  code: string;
  name: string;
  description: string;
  required: boolean;
  enabled: boolean;
  pricing: {
    billingCycle: "monthly" | "annual";
    currency: string;
    monthlyCents: number;
    annualCents: number;
    lineTotalCents: number;
  };
  usage: { metric: string; value: number };
};

export type ModulesView = {
  orgId: string;
  billingPlan: string;
  billingStatus: string;
  billingCycle: "monthly" | "annual";
  isTrialActive: boolean;
  trialEnd: string | null;
  modules: ProductModuleRow[];
  totals: {
    currency: string;
    monthlyTotalCents: number;
    annualTotalCents: number;
    enabledCount: number;
  };
};

export type BillingView = {
  orgId: string;
  billingEmail: string | null;
  billingPlan: string;
  billingStatus: string;
  billingCycle: "monthly" | "annual";
  isTrialActive: boolean;
  trialStart: string | null;
  trialEnd: string | null;
  externalCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeStatus: string | null;
  totals: ModulesView["totals"];
  modulesEnabled: Record<string, boolean>;
};

async function subscriptionFetch<T>(
  base: "modules" | "billing",
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const session = getVeriHubSession();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }
  const suffix = path ? `/${path.replace(/^\//, "")}` : "";
  const res = await fetch(`/api/${base}${suffix}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const details =
      typeof data?.details === "object" && data.details
        ? (data.details as { suggestion?: string })
        : undefined;
    const message =
      details?.suggestion ??
      (typeof data?.error === "string"
        ? data.error
        : `Request failed (${res.status})`);
    throw new Error(message);
  }
  return data as T;
}

export async function getSubscriptionModules() {
  return subscriptionFetch<ModulesView>("modules", "");
}

export async function updateSubscriptionModules(
  modules: { code: string; enabled: boolean }[],
) {
  return subscriptionFetch<ModulesView>("modules", "update", {
    method: "POST",
    body: JSON.stringify({ modules }),
  });
}

export async function getSubscriptionBilling() {
  return subscriptionFetch<BillingView>("billing", "");
}

export async function updateSubscriptionBilling(body: {
  billingPlan?: string;
  billingStatus?: string;
  billingCycle?: "monthly" | "annual";
}) {
  return subscriptionFetch<BillingView>("billing", "update", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function formatCents(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
