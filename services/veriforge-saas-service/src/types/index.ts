import type {
  BillingCycle,
  ModuleCode,
  OrgStatus,
  SubscriptionStatus,
  SystemRoleCode,
  UserStatus,
} from '@prisma/client';

export type { BillingCycle, ModuleCode, OrgStatus, SubscriptionStatus, SystemRoleCode, UserStatus };

export interface JwtPayload {
  sub: string;
  user_id: string;
  org_id: string;
  email: string;
  role: SystemRoleCode;
  permissions: string[];
  iat?: number;
  exp?: number;
}

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
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationDto {
  id: string;
  name: string;
  slug: string;
  status: OrgStatus;
  industry?: string | null;
  address?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  subscriptionProfile?: unknown;
  modulesEnabled?: unknown;
  trialStart: Date | null;
  trialEnd: Date | null;
  isTrialActive: boolean;
  externalCustomerId: string | null;
  billingEmail: string | null;
  defaultBillingCycle: BillingCycle;
  timezone: string;
  onboardingNotes?: string | null;
  onboardingChecklist?: unknown;
  createdAt: Date;
  updatedAt: Date;
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

export interface SignupInput {
  companyName: string;
  ownerEmail: string;
  password: string;
  ownerFullName?: string;
  selectedModules: ModuleCode[];
  billingCycle: BillingCycle;
  timezone?: string;
  industry?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  ownerFirstName?: string;
  ownerLastName?: string;
}

export interface InviteUserInput {
  orgId: string;
  email: string;
  fullName: string;
  role: Exclude<SystemRoleCode, 'owner'>;
  invitedByUserId: string;
}

export type { PermissionKey } from '../rbac/permission-catalog';
export { PERMISSION_KEYS, PERMISSIONS } from '../rbac/permission-catalog';
