import {
  SUBSCRIPTION_TIER_LABELS,
  VERA_MODULE_KEYS,
  type VeraModuleKey,
} from './admin-subscriptions.constants';
import type { SubscriptionDisplayTier } from './admin-subscriptions.types';

export function tierLabelFromKey(
  tierKey: string | null | undefined,
): SubscriptionDisplayTier {
  if (!tierKey) return 'Free';
  return (SUBSCRIPTION_TIER_LABELS[tierKey] ??
    'Custom') as SubscriptionDisplayTier;
}

export function monthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
    2,
    '0',
  )}`;
}

export function bucketByMonth(dates: Date[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const d of dates) {
    const k = monthKey(d);
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

export function parseModulesEnabled(
  raw: unknown,
  tierFeatures: unknown,
): string[] {
  const fromSub = Array.isArray(raw)
    ? raw.filter((x): x is string => typeof x === 'string')
    : [];
  if (fromSub.length > 0) return fromSub;

  const fromTier = Array.isArray(tierFeatures)
    ? tierFeatures.filter((x): x is string => typeof x === 'string')
    : [];
  return mapFeatureFlagsToModules(fromTier);
}

export function mapFeatureFlagsToModules(featureKeys: string[]): string[] {
  const set = new Set<string>();
  for (const key of featureKeys) {
    if (key.startsWith('core.')) set.add('core');
    if (key.startsWith('pm.')) set.add('pm');
    if (key.includes('training')) set.add('training');
    if (key.includes('equipment')) set.add('equipment');
    if (key.includes('compliance')) set.add('compliance');
    if (key.includes('union')) set.add('union_halls');
    if (key.includes('provider')) set.add('providers');
  }
  return VERA_MODULE_KEYS.filter((m) => set.has(m));
}

export function seatsFromTierLimits(
  limitsJson: unknown,
  fallback = 10,
): number {
  if (
    limitsJson &&
    typeof limitsJson === 'object' &&
    'maxUsers' in limitsJson
  ) {
    const n = Number((limitsJson as { maxUsers: unknown }).maxUsers);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return fallback;
}

export function isNearSeatLimit(used: number, purchased: number): boolean {
  if (purchased <= 0) return false;
  return used / purchased >= 0.9;
}

export function isAtRisk(
  churnScore: number | null | undefined,
  activeUsers: number,
  modulesCount: number,
): boolean {
  if (churnScore != null && churnScore >= 60) return true;
  if (activeUsers === 0 && modulesCount === 0) return true;
  return false;
}

export function normalizeModuleKey(key: string): VeraModuleKey | null {
  const k = key.toLowerCase().replace(/\s+/g, '_');
  if ((VERA_MODULE_KEYS as readonly string[]).includes(k))
    return k as VeraModuleKey;
  return null;
}
