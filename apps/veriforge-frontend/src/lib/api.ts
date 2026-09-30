import axios, { type AxiosError } from "axios";
import type {
  AdminOrgListResponse,
  AdminPricingConfig,
  BillingCycle,
  EnabledModuleRow,
  LoginRequest,
  LoginResponse,
  MeResponse,
  ModuleCatalogItem,
  ModuleCode,
  OrgStatus,
  PricingQuote,
  SignupRequest,
  SignupResponse,
  TrialResponse,
} from "../types/api";

const TOKEN_KEY = "vf_access_token";
const REFRESH_KEY = "vf_refresh_token";

export const tokenStore = {
  getAccess(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  getRefresh(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  },
  set(tokens: { accessToken: string; refreshToken: string }) {
    localStorage.setItem(TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = tokenStore.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getApiErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  const ax = err as AxiosError<{ error?: string; message?: string }>;
  return ax.response?.data?.error ?? ax.response?.data?.message ?? ax.message ?? fallback;
}

export function isPlatformAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const list = (import.meta.env.VITE_PLATFORM_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

export const authApi = {
  signup: (payload: SignupRequest) => api.post<SignupResponse>("/auth/signup", payload),
  login: (payload: LoginRequest) => api.post<LoginResponse>("/auth/login", payload),
  logout: (refreshToken?: string | null) =>
    api.post("/auth/logout", { refreshToken: refreshToken ?? tokenStore.getRefresh() }),
  me: () => api.get<MeResponse>("/auth/me"),
};

export const pricingApi = {
  quote: (modules: ModuleCode[], billingCycle: BillingCycle, currency = "USD") =>
    api.post<PricingQuote>("/pricing/quote", { modules, billingCycle, currency }),
};

export const modulesApi = {
  catalog: () => api.get<{ modules: ModuleCatalogItem[] }>("/modules"),
};

export const orgApi = {
  getTrial: (orgId: string) => api.get<TrialResponse>(`/organizations/${orgId}/trial`),
  listModules: (orgId: string) =>
    api.get<{ modules: EnabledModuleRow[] }>(`/organizations/${orgId}/modules`),
  convertBilling: (orgId: string, body?: { paymentMethodId?: string; billingCycle?: BillingCycle }) =>
    api.post(`/organizations/${orgId}/billing/convert`, body ?? {}),
  update: (
    orgId: string,
    body: Partial<{ name: string; billingCycle: BillingCycle; billingEmail: string; timezone: string }>,
  ) => api.patch<{ organization: MeResponse["organization"] }>(`/organizations/${orgId}`, body),
  invite: (
    orgId: string,
    body: { email: string; fullName: string; role?: string },
  ) => api.post(`/organizations/${orgId}/users/invite`, body),
};

export interface AdminOrgFilters {
  status?: OrgStatus;
  lifecycle?: "trial" | "active" | "suspended";
  module?: ModuleCode;
  moduleEnabled?: boolean;
  trialOnly?: boolean;
  skip?: number;
  take?: number;
}

export const adminApi = {
  listOrganizations: (params?: AdminOrgFilters) =>
    api.get<AdminOrgListResponse>("/admin/organizations", { params }),
  getOrganization: (orgId: string) =>
    api.get<{
      organization: MeResponse["organization"];
      modules: EnabledModuleRow[];
      trial: TrialResponse;
    }>(`/admin/organizations/${orgId}`),
  patchModules: (orgId: string, modules: { code: ModuleCode; enabled: boolean }[]) =>
    api.patch<{ modules: EnabledModuleRow[] }>(`/admin/organizations/${orgId}/modules`, {
      modules,
    }),
  patchSubscription: (
    orgId: string,
    body: { billingCycle?: BillingCycle; status?: OrgStatus; convertToActive?: boolean },
  ) => api.patch(`/admin/organizations/${orgId}/subscription`, body),
  extendTrial: (orgId: string, extraDays = 7) =>
    api.post<{ organization: MeResponse["organization"] }>(
      `/admin/organizations/${orgId}/trial/extend`,
      { extraDays },
    ),
  listOnboarding: () => api.get<AdminOrgListResponse>("/admin/onboarding"),
  patchOnboarding: (
    orgId: string,
    body: {
      notes?: string;
      checklist?: Record<string, boolean>;
      status?: "not_started" | "in_progress" | "completed";
      assignedTo?: string;
    },
  ) => api.patch<{ onboarding: unknown }>(`/admin/onboarding/${orgId}`, body),
  getPricing: () => api.get<AdminPricingConfig>("/admin/pricing"),
  updatePricing: (body: {
    annualDiscountPercent?: number;
    modulePrices?: { code: ModuleCode; monthlyCents: number; annualCents?: number }[];
  }) => api.patch<AdminPricingConfig>("/admin/pricing", body),
};
