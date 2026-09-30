/**
 * Product modules gated by SubscriptionProfile.modules_enabled.
 */

export const PRODUCT_MODULE_CODES = [
  "core",
  "pm",
  "safety",
  "compliance",
  "wallet",
  "training",
  "audits",
  "investigations",
  "scorecards",
  "hiring_client_tools",
] as const;

export type ProductModuleCode = (typeof PRODUCT_MODULE_CODES)[number];

export interface ProductModule {
  code: ProductModuleCode;
  name: string;
  description: string;
  required: boolean;
  enabled: boolean;
  monthlyCents: number;
  annualCents: number;
}

export interface ModuleUpdateInput {
  code: ProductModuleCode;
  enabled: boolean;
}
