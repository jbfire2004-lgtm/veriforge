/** Display tiers for admin subscription map (maps ACP tier keys). */
export const SUBSCRIPTION_TIER_LABELS: Record<string, string> = {
  free: 'Free',
  basic: 'Free',
  pro: 'Core',
  professional: 'PM',
  pm: 'PM',
  predictive: 'Full Suite',
  autonomous: 'Full Suite',
  marketplace: 'Full Suite',
  command_center: 'Full Suite',
  global_intelligence: 'Full Suite',
  enterprise: 'Full Suite',
  custom: 'Custom',
};

export const VERA_MODULE_KEYS = [
  'core',
  'pm',
  'training',
  'equipment',
  'compliance',
  'union_halls',
  'providers',
] as const;

export type VeraModuleKey = (typeof VERA_MODULE_KEYS)[number];

export const TIER_PIN_COLORS: Record<string, string> = {
  Free: '#94a3b8',
  Core: '#0d9488',
  PM: '#2563eb',
  'Full Suite': '#7c3aed',
  Custom: '#f59e0b',
};
