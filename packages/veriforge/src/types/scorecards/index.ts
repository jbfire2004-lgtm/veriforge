/**
 * Safety scorecard with compliance weighting.
 */

export type ComplianceBucket =
  | "valid"
  | "expiring"
  | "expired"
  | "missing"
  | "pending_review"
  | "rejected"
  | "active"
  | "inactive";

export interface ComplianceBreakdownEntry {
  bucket: ComplianceBucket | string;
  weight: number;
  artifactId: string | null;
}

export interface ComplianceBreakdown {
  base: number;
  required: Record<string, ComplianceBreakdownEntry>;
  customDelta: number;
  complianceDelta: number;
  calculatedAt: string;
}

export interface SafetyScorecard {
  orgId: string;
  complianceScore: number;
  complianceBreakdown: ComplianceBreakdown;
  overallScore: number;
  calculatedAt: string;
}
