/**
 * Subscription billing types.
 */

export type BillingPlan = "trial" | "starter" | "professional" | "enterprise";
export type BillingCycle = "monthly" | "annual";
export type BillingStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "unpaid"
  | "paused";

export interface SubscriptionProfile {
  id: string;
  orgId: string;
  modulesEnabled: Record<string, boolean>;
  billingPlan: BillingPlan;
  billingStatus: BillingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BillingView {
  orgId: string;
  billingEmail: string | null;
  billingPlan: BillingPlan;
  billingStatus: BillingStatus;
  billingCycle: BillingCycle;
  isTrialActive: boolean;
  trialEnd: string | null;
}

export interface BillingUpdateInput {
  billingPlan?: BillingPlan;
  billingStatus?: BillingStatus;
  billingCycle?: BillingCycle;
}
