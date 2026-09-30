import type { CacheEntityType } from "./types";

export type CachePolicy = {
  preload: boolean;
  lazy: boolean;
  ttlMs: number;
};

/** Cache policies per entity type (§2). */
export const DEFAULT_CACHE_POLICY: Partial<Record<CacheEntityType, CachePolicy>> = {
  worker: { preload: true, lazy: false, ttlMs: 24 * 60 * 60 * 1000 },
  equipment: { preload: true, lazy: false, ttlMs: 24 * 60 * 60 * 1000 },
  trainingRecord: { preload: false, lazy: true, ttlMs: 12 * 60 * 60 * 1000 },
  project: { preload: true, lazy: false, ttlMs: 24 * 60 * 60 * 1000 },
  task: { preload: true, lazy: false, ttlMs: 12 * 60 * 60 * 1000 },
  workPackage: { preload: true, lazy: false, ttlMs: 12 * 60 * 60 * 1000 },
  safetyFormDefinition: { preload: true, lazy: false, ttlMs: 7 * 24 * 60 * 60 * 1000 },
  projectAssignment: { preload: true, lazy: false, ttlMs: 6 * 60 * 60 * 1000 },
  inspectionChecklist: { preload: true, lazy: false, ttlMs: 7 * 24 * 60 * 60 * 1000 },
  inspection: { preload: false, lazy: true, ttlMs: 48 * 60 * 60 * 1000 },
  competencyRequirement: { preload: true, lazy: false, ttlMs: 7 * 24 * 60 * 60 * 1000 },
  companyLink: { preload: true, lazy: false, ttlMs: 12 * 60 * 60 * 1000 },
  equipmentLink: { preload: true, lazy: false, ttlMs: 12 * 60 * 60 * 1000 },
  dashboardSummary: { preload: true, lazy: false, ttlMs: 15 * 60 * 1000 },
  provider: { preload: false, lazy: true, ttlMs: 24 * 60 * 60 * 1000 },
  qrScan: { preload: false, lazy: true, ttlMs: 48 * 60 * 60 * 1000 },
  userProfile: { preload: true, lazy: false, ttlMs: 24 * 60 * 60 * 1000 },
  workerWalletBundle: { preload: false, lazy: true, ttlMs: 6 * 60 * 60 * 1000 },
  safetyFormTemplate: { preload: true, lazy: false, ttlMs: 7 * 24 * 60 * 60 * 1000 },
  safetyFormDraft: { preload: false, lazy: true, ttlMs: 30 * 24 * 60 * 60 * 1000 },
};

export function isExpired(expiresAt?: string): boolean {
  if (!expiresAt) return false;
  return Date.parse(expiresAt) < Date.now();
}

export function essentialTypesForPreload(): CacheEntityType[] {
  return Object.entries(DEFAULT_CACHE_POLICY)
    .filter(([, p]) => p?.preload)
    .map(([t]) => t as CacheEntityType);
}
