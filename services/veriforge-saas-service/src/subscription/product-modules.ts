import type { ModuleCode, ProductModuleCode } from '@prisma/client';

export type ProductModuleDefinition = {
  code: ProductModuleCode;
  name: string;
  description: string;
  sortOrder: number;
  /** Monthly price in cents (USD). Core is included in base plan. */
  monthlyCents: number;
  annualCents: number;
  required: boolean;
  /** Legacy Stripe/RBAC module codes synced when this product module is toggled. */
  legacyModules: ModuleCode[];
  usageMetric: string;
};

export const PRODUCT_MODULE_CODES: ProductModuleCode[] = [
  'core',
  'pm',
  'safety',
  'compliance',
  'wallet',
  'training',
  'audits',
  'investigations',
  'scorecards',
  'hiring_client_tools',
];

export const PRODUCT_MODULES: ProductModuleDefinition[] = [
  {
    code: 'core',
    name: 'Core',
    description: 'Workforce hub, org console, and platform foundation',
    sortOrder: 1,
    monthlyCents: 0,
    annualCents: 0,
    required: true,
    legacyModules: ['vericore', 'verihub'],
    usageMetric: 'active_users',
  },
  {
    code: 'pm',
    name: 'Project Management',
    description: 'Projects, tasks, timelines, and field coordination',
    sortOrder: 2,
    monthlyCents: 39900,
    annualCents: 399000,
    required: false,
    legacyModules: ['veripm'],
    usageMetric: 'active_projects',
  },
  {
    code: 'safety',
    name: 'Safety',
    description: 'Observations, incidents, and safety workflows',
    sortOrder: 3,
    monthlyCents: 24900,
    annualCents: 249000,
    required: false,
    legacyModules: ['veripm'],
    usageMetric: 'safety_events',
  },
  {
    code: 'compliance',
    name: 'Compliance',
    description: 'Insurance, WCB, COR, SCSA artifacts and scorecards',
    sortOrder: 4,
    monthlyCents: 19900,
    annualCents: 199000,
    required: false,
    legacyModules: ['vericore'],
    usageMetric: 'compliance_artifacts',
  },
  {
    code: 'wallet',
    name: 'Wallet',
    description: 'Credential wallet and portable training records',
    sortOrder: 5,
    monthlyCents: 9900,
    annualCents: 99000,
    required: false,
    legacyModules: ['vericore'],
    usageMetric: 'wallet_credentials',
  },
  {
    code: 'training',
    name: 'Training',
    description: 'Training ingestion, standards, and completions',
    sortOrder: 6,
    monthlyCents: 14900,
    annualCents: 149000,
    required: false,
    legacyModules: ['vericore'],
    usageMetric: 'training_records',
  },
  {
    code: 'audits',
    name: 'Audits',
    description: 'Audit programs, findings, and corrective actions',
    sortOrder: 7,
    monthlyCents: 17900,
    annualCents: 179000,
    required: false,
    legacyModules: ['veripm'],
    usageMetric: 'open_audits',
  },
  {
    code: 'investigations',
    name: 'Investigations',
    description: 'Incident investigations and root-cause tracking',
    sortOrder: 8,
    monthlyCents: 17900,
    annualCents: 179000,
    required: false,
    legacyModules: ['veripm'],
    usageMetric: 'open_investigations',
  },
  {
    code: 'scorecards',
    name: 'Scorecards',
    description: 'Contractor scorecards and hiring-client visibility',
    sortOrder: 9,
    monthlyCents: 12900,
    annualCents: 129000,
    required: false,
    legacyModules: ['vericore'],
    usageMetric: 'scorecard_reviews',
  },
  {
    code: 'hiring_client_tools',
    name: 'Hiring Client Tools',
    description: 'Client review portal integrations and award workflows',
    sortOrder: 10,
    monthlyCents: 9900,
    annualCents: 99000,
    required: false,
    legacyModules: ['verihub'],
    usageMetric: 'client_reviews',
  },
];

const MODULE_BY_CODE = new Map(PRODUCT_MODULES.map((m) => [m.code, m]));

export function getProductModule(code: ProductModuleCode): ProductModuleDefinition {
  const mod = MODULE_BY_CODE.get(code);
  if (!mod) throw new Error(`Unknown product module: ${code}`);
  return mod;
}

export function isProductModuleCode(value: string): value is ProductModuleCode {
  return PRODUCT_MODULE_CODES.includes(value as ProductModuleCode);
}

/** Map legacy signup module selection to default product entitlements. */
export function defaultModulesFromLegacySelection(
  legacyCodes: ModuleCode[],
): Record<ProductModuleCode, boolean> {
  const enabled = new Set<ProductModuleCode>(['core']);
  if (legacyCodes.includes('vericore')) {
    enabled.add('training');
    enabled.add('wallet');
    enabled.add('compliance');
    enabled.add('scorecards');
  }
  if (legacyCodes.includes('veripm')) {
    enabled.add('pm');
    enabled.add('safety');
    enabled.add('audits');
    enabled.add('investigations');
  }
  if (legacyCodes.includes('verihub')) {
    enabled.add('hiring_client_tools');
  }
  const map = {} as Record<ProductModuleCode, boolean>;
  for (const code of PRODUCT_MODULE_CODES) {
    map[code] = enabled.has(code);
  }
  return map;
}

export function legacyCodesForEnabledProductModules(
  modulesEnabled: Record<string, boolean>,
): ModuleCode[] {
  const legacy = new Set<ModuleCode>();
  for (const mod of PRODUCT_MODULES) {
    if (modulesEnabled[mod.code]) {
      for (const code of mod.legacyModules) legacy.add(code);
    }
  }
  legacy.add('verihub');
  return [...legacy];
}

export function parseModulesEnabledJson(raw: unknown): Record<ProductModuleCode, boolean> {
  const base = {} as Record<ProductModuleCode, boolean>;
  for (const code of PRODUCT_MODULE_CODES) base[code] = false;
  base.core = true;

  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
      if (isProductModuleCode(key)) base[key] = Boolean(value);
    }
    base.core = true;
    return base;
  }

  return base;
}
