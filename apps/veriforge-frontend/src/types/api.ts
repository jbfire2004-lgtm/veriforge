export type ModuleCode = "vericore" | "veripm" | "verihub";
export type BillingCycle = "monthly" | "annual";
export type OrgStatus = "active" | "suspended" | "closed";
export type UserStatus = "invited" | "active" | "disabled";
export type SystemRoleCode = "owner" | "admin" | "manager" | "user";
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "unpaid"
  | "paused";

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface SafeUser {
  id: string;
  orgId: string;
  email: string;
  fullName: string;
  status: UserStatus;
  role: SystemRoleCode | null;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: OrgStatus;
  trialStart: string | null;
  trialEnd: string | null;
  isTrialActive: boolean;
  externalCustomerId: string | null;
  billingEmail: string | null;
  defaultBillingCycle: BillingCycle;
  timezone: string;
  onboardingNotes?: string | null;
  onboardingChecklist?: Record<string, boolean> | null;
  createdAt: string;
  updatedAt: string;
}

export interface PricingLineItem {
  moduleCode: ModuleCode;
  moduleName: string;
  billingCycle: BillingCycle;
  unitAmountCents: number;
  quantity: number;
  lineTotalCents: number;
  currency: string;
  externalPriceId: string | null;
}

export interface PricingQuote {
  currency: string;
  billingCycle: BillingCycle;
  lineItems: PricingLineItem[];
  monthlyTotalCents: number;
  annualTotalCents: number;
  selectedCycleTotalCents: number;
  annualDiscountPercent: number;
}

export interface SignupRequest {
  companyName: string;
  ownerEmail: string;
  password: string;
  ownerFullName: string;
  selectedModules: ModuleCode[];
  billingCycle: BillingCycle;
  timezone?: string;
}

export interface SignupResponse {
  organization: Organization;
  user: SafeUser;
  tokens: SessionTokens;
  quote: PricingQuote;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: SafeUser;
  tokens: SessionTokens;
}

export interface MeResponse {
  user: SafeUser;
  organization: Organization;
}

export interface TrialResponse {
  organization: Organization;
  subscriptionStatus: SubscriptionStatus | null;
  daysRemaining: number;
  msRemaining: number;
}

export interface ModuleCatalogItem {
  id: string;
  code: ModuleCode;
  name: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface EnabledModuleRow {
  id: string;
  enabled: boolean;
  module: ModuleCatalogItem;
}

export const PERMISSIONS = {
  ORG_USERS_MANAGE: "org.users.manage",
  ORG_BILLING_MANAGE: "org.billing.manage",
  ORG_PROFILE_UPDATE: "org.profile.update",
  ORG_TRIAL_EXTEND: "org.trial.extend",
  PLATFORM_ADMIN: "platform.admin",
  VERICORE_AUDIT_VIEW: "vericore.audit.view",
  VERICORE_AUDIT_EDIT: "vericore.audit.edit",
  VERIPM_PROJECT_VIEW: "veripm.project.view",
  VERIPM_PROJECT_EDIT: "veripm.project.edit",
  VERIHUB_FILE_UPLOAD: "verihub.file.upload",
  VERIHUB_FILE_DELETE: "verihub.file.delete",
} as const;

export interface AdminOrgModuleRow {
  id: string;
  enabled: boolean;
  module: ModuleCatalogItem;
}

export interface AdminOrgListItem extends Organization {
  modules: AdminOrgModuleRow[];
  subscription: {
    id: string;
    status: SubscriptionStatus;
    billingCycle: BillingCycle;
  } | null;
  onboarding?: {
    id: string;
    status: "not_started" | "in_progress" | "completed";
    notes: string | null;
    checklist: Record<string, boolean> | null;
    assignedTo: string | null;
    startedAt?: string | null;
    completedAt?: string | null;
  };
}

export interface AdminOrgListResponse {
  items: AdminOrgListItem[];
  total: number;
}

export interface AdminPricingConfig {
  currency: string;
  annualDiscountPercent: number;
  modules: {
    code: ModuleCode;
    name: string;
    monthlyCents: number;
    annualCents: number | null;
    monthlyExternalPriceId: string | null;
    annualExternalPriceId: string | null;
  }[];
}

export const MODULE_META: Record<
  ModuleCode,
  { label: string; blurb: string; path: string }
> = {
  vericore: {
    label: "VeriCore",
    blurb: "Compliance, credentials, and workforce workflows.",
    path: "/modules/vericore",
  },
  veripm: {
    label: "VeriPM",
    blurb: "Projects, tasks, and field safety operations.",
    path: "/modules/veripm",
  },
  verihub: {
    label: "VeriHub",
    blurb: "Files, collaboration, and shared workspace surfaces.",
    path: "/modules/verihub",
  },
};
