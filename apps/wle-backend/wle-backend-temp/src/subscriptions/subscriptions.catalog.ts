/** Commercial plan keys shown in pricing UI and comparison table. */
export type CommercialPlanKey =
  | 'basic'
  | 'pro'
  | 'pm'
  | 'predictive'
  | 'autonomous'
  | 'enterprise'
  | 'command_center'
  | 'global_intelligence'
  | 'marketplace';

export type ComparisonTierKey = CommercialPlanKey;

export type SubscriptionModuleKey =
  | 'hub'
  | 'core'
  | 'pm'
  | 'addon_ocr'
  | 'addon_predictive'
  | 'addon_autonomous'
  | 'addon_command_center'
  | 'addon_marketplace';

export const COMPARISON_TIER_KEYS: ComparisonTierKey[] = [
  'basic',
  'pro',
  'pm',
  'predictive',
  'autonomous',
  'enterprise',
  'command_center',
  'global_intelligence',
  'marketplace',
];

export const COMPARISON_TIER_LABELS: Record<ComparisonTierKey, string> = {
  basic: 'Basic',
  pro: 'Pro',
  pm: 'PM',
  predictive: 'Predictive',
  autonomous: 'Autonomous',
  enterprise: 'Enterprise',
  command_center: 'Command Center',
  global_intelligence: 'Global Intelligence',
  marketplace: 'Marketplace',
};

/** Maps commercial plan → ACP subscription tier row key. */
export const PLAN_ACP_TIER_MAP: Record<CommercialPlanKey, string> = {
  basic: 'basic',
  pro: 'pro',
  pm: 'pm',
  predictive: 'predictive',
  autonomous: 'autonomous',
  enterprise: 'enterprise',
  command_center: 'command_center',
  global_intelligence: 'global_intelligence',
  marketplace: 'marketplace',
};

export type SubscriptionModuleCard = {
  key: SubscriptionModuleKey;
  title: string;
  description: string;
  includedFeatures: string[];
  tierAvailability: ComparisonTierKey[];
};

export const SUBSCRIPTION_MODULES: SubscriptionModuleCard[] = [
  {
    key: 'hub',
    title: 'Vera Hub',
    description:
      'Industry home, social feed, job board, expert Q&A, and your signed-in workspace launcher.',
    includedFeatures: [
      'Hub dashboard & navigation',
      'Social feed & activity',
      'Safety blog & bulletins',
      'Job board & experts',
    ],
    tierAvailability: [
      'basic',
      'pro',
      'pm',
      'predictive',
      'autonomous',
      'enterprise',
      'command_center',
      'global_intelligence',
      'marketplace',
    ],
  },
  {
    key: 'core',
    title: 'Vera Core',
    description:
      'Worker & equipment profiles, training ingestion, daily logs, site risks, and compliance records.',
    includedFeatures: [
      'Worker & equipment profiles',
      'Training ingestion & records',
      'Site risks & action items',
      'Meeting records & daily logs',
    ],
    tierAvailability: [
      'pro',
      'pm',
      'predictive',
      'autonomous',
      'enterprise',
      'command_center',
      'global_intelligence',
      'marketplace',
    ],
  },
  {
    key: 'pm',
    title: 'Vera PM',
    description:
      'Project safety execution — forms, inspections, incidents, CAPA, SMS, and unified safety hub.',
    includedFeatures: [
      'Safety forms & JHA/FLHA',
      'Inspections & incidents',
      'Unified Safety Hub & CAIL',
      'SMS core (SCL / HECA / Energy)',
    ],
    tierAvailability: [
      'pm',
      'predictive',
      'autonomous',
      'enterprise',
      'command_center',
      'global_intelligence',
      'marketplace',
    ],
  },
  {
    key: 'addon_ocr',
    title: 'Vision OCR',
    description:
      'Scan credentials, SDS sheets, and field documents with AI extraction.',
    includedFeatures: ['Document OCR', 'Credential parsing', 'SDS indexing'],
    tierAvailability: ['pro', 'pm', 'predictive', 'enterprise', 'marketplace'],
  },
  {
    key: 'addon_predictive',
    title: 'Predictive Analytics',
    description:
      'Forecast risk, high-risk workers/sites, and preventive recommendations.',
    includedFeatures: [
      'Weekly risk forecast',
      'Leading indicators',
      'PM predictive module',
    ],
    tierAvailability: ['predictive', 'enterprise', 'global_intelligence'],
  },
  {
    key: 'addon_autonomous',
    title: 'Autonomous Dispatch',
    description:
      'Automated crew dispatch, routing, and safety-gated work assignments.',
    includedFeatures: [
      'Autonomous dispatch',
      'Safety gating',
      'Operations automation',
    ],
    tierAvailability: ['autonomous', 'enterprise'],
  },
  {
    key: 'addon_command_center',
    title: 'Command Center',
    description:
      'Enterprise command dashboards, escalation, and multi-site oversight.',
    includedFeatures: [
      'Command dashboards',
      'Escalation workflows',
      'Multi-site KPIs',
    ],
    tierAvailability: ['command_center', 'enterprise'],
  },
  {
    key: 'addon_marketplace',
    title: 'Marketplace',
    description:
      'Industry ecosystem — providers, integrations, and shared safety services.',
    includedFeatures: [
      'Provider marketplace',
      'Integration catalog',
      'Shared services',
    ],
    tierAvailability: ['marketplace', 'enterprise'],
  },
];

export type ComparisonRow = {
  key: string;
  label: string;
  tiers: Record<ComparisonTierKey, boolean | 'addon'>;
};

export const FEATURE_COMPARISON_ROWS: ComparisonRow[] = [
  {
    key: 'worker_profiles',
    label: 'Worker profiles',
    tiers: {
      basic: false,
      pro: true,
      pm: true,
      predictive: true,
      autonomous: true,
      enterprise: true,
      command_center: true,
      global_intelligence: true,
      marketplace: true,
    },
  },
  {
    key: 'equipment_profiles',
    label: 'Equipment profiles',
    tiers: {
      basic: false,
      pro: true,
      pm: true,
      predictive: true,
      autonomous: true,
      enterprise: true,
      command_center: true,
      global_intelligence: true,
      marketplace: true,
    },
  },
  {
    key: 'training_ingestion',
    label: 'Training ingestion',
    tiers: {
      basic: false,
      pro: true,
      pm: true,
      predictive: true,
      autonomous: true,
      enterprise: true,
      command_center: true,
      global_intelligence: true,
      marketplace: true,
    },
  },
  {
    key: 'vision_ocr',
    label: 'Vision OCR',
    tiers: {
      basic: false,
      pro: 'addon',
      pm: 'addon',
      predictive: 'addon',
      autonomous: false,
      enterprise: true,
      command_center: true,
      global_intelligence: true,
      marketplace: 'addon',
    },
  },
  {
    key: 'digital_twins',
    label: 'Digital twins',
    tiers: {
      basic: false,
      pro: false,
      pm: false,
      predictive: true,
      autonomous: true,
      enterprise: true,
      command_center: true,
      global_intelligence: true,
      marketplace: false,
    },
  },
  {
    key: 'safety_forms',
    label: 'Safety forms',
    tiers: {
      basic: false,
      pro: false,
      pm: true,
      predictive: true,
      autonomous: true,
      enterprise: true,
      command_center: true,
      global_intelligence: true,
      marketplace: false,
    },
  },
  {
    key: 'predictive_scheduling',
    label: 'Predictive scheduling',
    tiers: {
      basic: false,
      pro: false,
      pm: false,
      predictive: true,
      autonomous: true,
      enterprise: true,
      command_center: true,
      global_intelligence: true,
      marketplace: false,
    },
  },
  {
    key: 'autonomous_dispatch',
    label: 'Autonomous dispatch',
    tiers: {
      basic: false,
      pro: false,
      pm: false,
      predictive: false,
      autonomous: true,
      enterprise: true,
      command_center: true,
      global_intelligence: false,
      marketplace: false,
    },
  },
  {
    key: 'automation_layer',
    label: 'Automation layer',
    tiers: {
      basic: false,
      pro: false,
      pm: false,
      predictive: false,
      autonomous: true,
      enterprise: true,
      command_center: true,
      global_intelligence: true,
      marketplace: false,
    },
  },
  {
    key: 'command_center',
    label: 'Command center',
    tiers: {
      basic: false,
      pro: false,
      pm: false,
      predictive: false,
      autonomous: false,
      enterprise: true,
      command_center: true,
      global_intelligence: true,
      marketplace: false,
    },
  },
  {
    key: 'global_intelligence',
    label: 'Global intelligence',
    tiers: {
      basic: false,
      pro: false,
      pm: false,
      predictive: false,
      autonomous: false,
      enterprise: true,
      command_center: false,
      global_intelligence: true,
      marketplace: false,
    },
  },
  {
    key: 'marketplace',
    label: 'Marketplace',
    tiers: {
      basic: false,
      pro: false,
      pm: false,
      predictive: false,
      autonomous: false,
      enterprise: true,
      command_center: false,
      global_intelligence: false,
      marketplace: true,
    },
  },
];

export type PricingPlan = {
  key: CommercialPlanKey;
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
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    key: 'basic',
    name: 'Basic',
    tagline: 'Get started with Vera Hub',
    priceMonthly: 0,
    priceAnnual: 0,
    currency: 'USD',
    modules: ['Vera Hub'],
    features: ['Hub dashboard', 'Social feed', 'Safety blog', 'Job board'],
    acpTierKey: 'basic',
    featureKeys: ['hub.social'],
  },
  {
    key: 'pro',
    name: 'Pro',
    tagline: 'Core workforce & equipment',
    priceMonthly: 49,
    priceAnnual: 470,
    currency: 'USD',
    modules: ['Vera Hub', 'Vera Core'],
    features: [
      'Worker & equipment profiles',
      'Training ingestion',
      'Core compliance',
    ],
    acpTierKey: 'pro',
    featureKeys: [
      'hub.social',
      'core.workers',
      'core.equipment',
      'core.training',
    ],
  },
  {
    key: 'pm',
    name: 'PM',
    tagline: 'Full project safety suite',
    priceMonthly: 149,
    priceAnnual: 1430,
    currency: 'USD',
    modules: ['Vera Hub', 'Vera Core', 'Vera PM'],
    features: [
      'Safety forms & inspections',
      'SMS core',
      'Unified Safety Hub',
      'CAPA & incidents',
    ],
    highlighted: true,
    acpTierKey: 'pm',
    featureKeys: [
      'hub.social',
      'core.workers',
      'core.equipment',
      'core.training',
      'pm.sms',
      'pm.inspections.ai',
      'contractor.portal',
      'pm.substance_testing',
    ],
  },
  {
    key: 'predictive',
    name: 'Predictive',
    tagline: 'Analytics & digital twins',
    priceMonthly: 299,
    priceAnnual: 2870,
    currency: 'USD',
    modules: ['Hub', 'Core', 'PM', 'Predictive'],
    features: ['Predictive analytics', 'Digital twins', 'Risk forecasting'],
    acpTierKey: 'predictive',
    featureKeys: [
      'hub.social',
      'core.workers',
      'core.equipment',
      'core.training',
      'pm.sms',
      'pm.inspections.ai',
      'contractor.portal',
      'pm.substance_testing',
      'pm.predictive',
      'addon.digital_twins',
    ],
  },
  {
    key: 'autonomous',
    name: 'Autonomous',
    tagline: 'Dispatch & automation',
    priceMonthly: 499,
    priceAnnual: 4790,
    currency: 'USD',
    modules: ['Hub', 'Core', 'PM', 'Autonomous'],
    features: [
      'Autonomous dispatch',
      'Automation layer',
      'Predictive scheduling',
    ],
    acpTierKey: 'autonomous',
    featureKeys: [
      'hub.social',
      'core.workers',
      'core.equipment',
      'core.training',
      'pm.sms',
      'pm.inspections.ai',
      'contractor.portal',
      'pm.substance_testing',
      'pm.predictive',
      'addon.autonomous',
      'addon.automation',
    ],
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    tagline: 'All modules & platform admin',
    priceMonthly: 999,
    priceAnnual: 9590,
    currency: 'USD',
    modules: ['All Vera modules'],
    features: [
      'Everything in PM + Predictive',
      'Command center',
      'ACP admin',
      'Priority support',
    ],
    acpTierKey: 'enterprise',
    featureKeys: [
      'hub.social',
      'core.workers',
      'core.equipment',
      'core.training',
      'pm.sms',
      'pm.inspections.ai',
      'contractor.portal',
      'pm.substance_testing',
      'pm.predictive',
      'addon.digital_twins',
      'addon.autonomous',
      'addon.automation',
      'addon.command_center',
      'addon.marketplace',
      'acp.enabled',
    ],
  },
  {
    key: 'command_center',
    name: 'Command Center',
    tagline: 'Multi-site enterprise command',
    priceMonthly: 749,
    priceAnnual: 7190,
    currency: 'USD',
    modules: ['Hub', 'Core', 'PM', 'Command Center'],
    features: ['Command dashboards', 'Escalation workflows', 'Multi-site KPIs'],
    acpTierKey: 'command_center',
    featureKeys: [
      'hub.social',
      'core.workers',
      'core.equipment',
      'core.training',
      'pm.sms',
      'pm.inspections.ai',
      'contractor.portal',
      'pm.substance_testing',
      'pm.predictive',
      'addon.command_center',
    ],
  },
  {
    key: 'global_intelligence',
    name: 'Global Intelligence',
    tagline: 'Cross-site intelligence layer',
    priceMonthly: 849,
    priceAnnual: 8150,
    currency: 'USD',
    modules: ['Hub', 'Core', 'PM', 'Global Intelligence'],
    features: ['Global intelligence', 'Digital twins', 'Predictive analytics'],
    acpTierKey: 'global_intelligence',
    featureKeys: [
      'hub.social',
      'core.workers',
      'core.equipment',
      'core.training',
      'pm.sms',
      'pm.inspections.ai',
      'contractor.portal',
      'pm.substance_testing',
      'pm.predictive',
      'addon.digital_twins',
      'addon.global_intelligence',
    ],
  },
  {
    key: 'marketplace',
    name: 'Marketplace',
    tagline: 'Industry ecosystem & integrations',
    priceMonthly: 399,
    priceAnnual: 3830,
    currency: 'USD',
    modules: ['Hub', 'Core', 'PM', 'Marketplace'],
    features: [
      'Provider marketplace',
      'Integration catalog',
      'Shared services',
    ],
    acpTierKey: 'marketplace',
    featureKeys: [
      'hub.social',
      'core.workers',
      'core.equipment',
      'core.training',
      'pm.sms',
      'addon.marketplace',
    ],
  },
];

export type SubscriptionAddon = {
  key: string;
  name: string;
  description: string;
  priceMonthly: number;
  featureKeys: string[];
  moduleKey: SubscriptionModuleKey;
};

export const SUBSCRIPTION_ADDONS: SubscriptionAddon[] = [
  {
    key: 'ocr',
    name: 'Vision OCR',
    description: 'AI document scanning for credentials and SDS.',
    priceMonthly: 29,
    featureKeys: ['addon.vision_ocr'],
    moduleKey: 'addon_ocr',
  },
  {
    key: 'predictive',
    name: 'Predictive Analytics',
    description: 'Risk forecasting and PM predictive module.',
    priceMonthly: 79,
    featureKeys: ['pm.predictive', 'addon.digital_twins'],
    moduleKey: 'addon_predictive',
  },
  {
    key: 'autonomous',
    name: 'Autonomous Dispatch',
    description: 'Automated crew routing with safety gating.',
    priceMonthly: 129,
    featureKeys: ['addon.autonomous', 'addon.automation'],
    moduleKey: 'addon_autonomous',
  },
  {
    key: 'command_center',
    name: 'Command Center',
    description: 'Enterprise multi-site command dashboards.',
    priceMonthly: 199,
    featureKeys: ['addon.command_center'],
    moduleKey: 'addon_command_center',
  },
  {
    key: 'marketplace',
    name: 'Marketplace',
    description: 'Industry ecosystem & integrations.',
    priceMonthly: 49,
    featureKeys: ['addon.marketplace'],
    moduleKey: 'addon_marketplace',
  },
];

export function getPlanByKey(key: string): PricingPlan | undefined {
  return PRICING_PLANS.find((p) => p.key === key);
}

export function getAddonByKey(key: string): SubscriptionAddon | undefined {
  return SUBSCRIPTION_ADDONS.find((a) => a.key === key);
}
