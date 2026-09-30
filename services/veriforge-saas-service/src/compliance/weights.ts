/**
 * Per-artifact-type compliance weighting for contractor safety scorecards.
 */
export const REQUIRED_COMPLIANCE_TYPES = [
  'insurance',
  'wcb',
  'cor',
  'scsa',
] as const;

export type RequiredComplianceType = (typeof REQUIRED_COMPLIANCE_TYPES)[number];

/** Days before expiry when insurance earns "expiring" credit. */
export const COMPLIANCE_EXPIRING_SOON_DAYS = 30;

/** Neutral baseline before applying artifact deltas. */
export const COMPLIANCE_BASE_SCORE = 50;

export const INSURANCE_WEIGHTS = {
  valid: 10,
  expiring: 5,
  expired: -15,
  missing: -25,
  pending_review: 0,
  rejected: -10,
} as const;

export const WCB_WEIGHTS = {
  valid: 10,
  expired: -20,
  missing: -20,
  pending_review: 0,
  rejected: -15,
} as const;

export const COR_WEIGHTS = {
  valid: 15,
  expired: -10,
  missing: -25,
  pending_review: 0,
  rejected: -10,
} as const;

export const SCSA_WEIGHTS = {
  active: 10,
  inactive: -10,
} as const;

export type InsuranceBucket = keyof typeof INSURANCE_WEIGHTS;
export type WcbBucket = keyof typeof WCB_WEIGHTS;
export type CorBucket = keyof typeof COR_WEIGHTS;
export type ScsaBucket = keyof typeof SCSA_WEIGHTS;

export type TypeComplianceBucket =
  | InsuranceBucket
  | WcbBucket
  | CorBucket
  | ScsaBucket;

export const COMPLIANCE_TYPE_WEIGHTS = {
  insurance: INSURANCE_WEIGHTS,
  wcb: WCB_WEIGHTS,
  cor: COR_WEIGHTS,
  scsa: SCSA_WEIGHTS,
} as const;

/** @deprecated Use per-type weights in COMPLIANCE_TYPE_WEIGHTS */
export const COMPLIANCE_WEIGHTS = INSURANCE_WEIGHTS;
