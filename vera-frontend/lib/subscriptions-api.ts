import { API_URL, apiFetchJson } from "./api-fetch";

const BASE = `${API_URL}/api/v1/subscriptions`;

export type SubscriptionCatalog = {
  modules: Array<{
    key: string;
    title: string;
    description: string;
    includedFeatures: string[];
    tierAvailability: string[];
  }>;
  comparison: {
    tierKeys: string[];
    tierLabels: Record<string, string>;
    rows: Array<{
      key: string;
      label: string;
      tiers: Record<string, boolean | "addon">;
    }>;
  };
  plans: Array<{
    key: string;
    name: string;
    tagline: string;
    priceMonthly: number;
    priceAnnual: number;
    currency: string;
    modules: string[];
    features: string[];
    highlighted?: boolean;
    acpTierKey: string;
    featureKeys: string[];
  }>;
  addons: Array<{
    key: string;
    name: string;
    description: string;
    priceMonthly: number;
    featureKeys: string[];
    moduleKey: string;
  }>;
};

export type SubscriptionMe = {
  tenantId: string | null;
  subscription: {
    tier: { key: string; name: string };
    status: string;
  } | null;
  features: string[];
};

export async function fetchSubscriptionCatalog() {
  return apiFetchJson<SubscriptionCatalog>(`${BASE}/catalog`, { requireAuth: false });
}

export async function fetchSubscriptionTiers() {
  return apiFetchJson(`${BASE}/tiers`, { requireAuth: false });
}

export async function fetchSubscriptionFeatures() {
  return apiFetchJson(`${BASE}/features`, { requireAuth: false });
}

export async function fetchMySubscription() {
  return apiFetchJson<SubscriptionMe>(`${BASE}/me`);
}

export async function purchaseSubscription(body: {
  planKey: string;
  addonKeys?: string[];
}) {
  return apiFetchJson<{
    ok: boolean;
    tenantId: string;
    planKey: string;
    tierKey: string;
    redirectUrl: string;
  }>(`${BASE}/purchase`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function purchaseAddons(body: { addonKeys: string[] }) {
  return apiFetchJson<{
    ok: boolean;
    tenantId: string;
    redirectUrl: string;
  }>(`${BASE}/addons`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
