import { apiFetchJson } from "@/lib/api-fetch";

const BASE = "/api/v1/admin/subscriptions";

export type SubscriptionDisplayTier = "Free" | "Core" | "PM" | "Full Suite" | "Custom";

export type SubscriptionRow = {
  id: string;
  companyId: number | null;
  companyName: string;
  tenantId: string | null;
  tier: SubscriptionDisplayTier;
  tierKey: string;
  seatsPurchased: number;
  seatsUsed: number;
  modulesEnabled: string[];
  renewalDate: string | null;
  status: string;
  location: {
    city: string | null;
    province: string | null;
    lat: number | null;
    lng: number | null;
  };
  industry: string | null;
  activeUsers: number;
  churnRiskScore: number;
  createdAt: string;
};

export type SubscriptionMapPin = {
  companyId: number;
  companyName: string;
  lat: number;
  lng: number;
  tier: SubscriptionDisplayTier;
  seatsUsed: number;
  seatsPurchased: number;
  modulesEnabled: string[];
  renewalDate: string | null;
  status: string;
};

export type SubscriptionSummary = {
  totalCompanies: number;
  totalActiveUsers: number;
  totalSeatsPurchased: number;
  totalSeatsUsed: number;
  averageSeatsPerCompany: number;
  topTierAdoption: { tier: string; count: number };
  fastestGrowingModule: { module: string; growthPercent: number };
  companiesAtRisk: number;
  companiesNearSeatLimit: number;
  adoptionByTier: Record<string, number>;
  adoptionByModule: Record<string, number>;
};

export type SubscriptionGrowth = {
  newCompaniesByMonth: Record<string, number>;
  newUsersByMonth: Record<string, number>;
  seatUpgradesByMonth: Record<string, number>;
};

export type UpdateSubscriptionPayload = {
  companyId?: number;
  tenantId?: string;
  tierKey?: string;
  seatsPurchased?: number;
  modulesEnabled?: string[];
  status?: string;
  renewalDate?: string;
  tenantStatus?: string;
};

export function fetchAdminSubscriptions() {
  return apiFetchJson<SubscriptionRow[]>(BASE);
}

export function fetchAdminSubscriptionsSummary() {
  return apiFetchJson<SubscriptionSummary>(`${BASE}/summary`);
}

export function fetchAdminSubscriptionsMap() {
  return apiFetchJson<SubscriptionMapPin[]>(`${BASE}/map`);
}

export function fetchAdminSubscriptionsGrowth() {
  return apiFetchJson<SubscriptionGrowth>(`${BASE}/growth`);
}

export function updateAdminSubscription(payload: UpdateSubscriptionPayload) {
  return apiFetchJson<SubscriptionRow>(`${BASE}/update`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
