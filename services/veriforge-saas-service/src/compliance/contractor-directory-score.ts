import type {
  ContractorAuditResult,
  ContractorDocumentStatus,
  InsuranceStatus,
  PvsVerificationStatus,
} from '@prisma/client';
import { requiredProgramCategories } from '../pvs/safety-matrix';

/**
 * Directory compliance weights — PVS contributes 15% (within 10–20% target).
 * documents 35% + audits 35% + insurance 15% + pvs 15% = 100%.
 */
export const COMPLIANCE_WEIGHTS = {
  documents: 0.35,
  audits: 0.35,
  insurance: 0.15,
  pvs: 0.15,
} as const;

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function documentStatusScore(status: ContractorDocumentStatus): number {
  switch (status) {
    case 'valid':
      return 100;
    case 'pending_review':
      return 55;
    case 'expired':
      return 15;
    case 'rejected':
      return 10;
    case 'missing':
      return 0;
    default:
      return 0;
  }
}

function auditResultScore(result: ContractorAuditResult, score?: number | null): number {
  if (typeof score === 'number' && Number.isFinite(score)) {
    return clamp(score);
  }
  switch (result) {
    case 'pass':
      return 95;
    case 'conditional':
      return 70;
    case 'fail':
      return 25;
    case 'pending':
      return 40;
    default:
      return 0;
  }
}

export function insuranceStatusScore(status: InsuranceStatus): number {
  switch (status) {
    case 'valid':
      return 100;
    case 'expiring':
      return 65;
    case 'expired':
      return 10;
    case 'missing':
      return 0;
    case 'unknown':
      return 35;
    default:
      return 0;
  }
}

export function deriveInsuranceStatus(docs: {
  kind: string;
  status: ContractorDocumentStatus;
  expiryDate?: Date | null;
}[]): InsuranceStatus {
  const insurance = docs.filter((d) => d.kind === 'insurance');
  if (!insurance.length) return 'missing';
  const now = Date.now();
  const soon = now + 30 * 86_400_000;
  let best: InsuranceStatus = 'missing';
  for (const d of insurance) {
    if (d.status === 'expired' || (d.expiryDate && d.expiryDate.getTime() < now)) {
      if (best !== 'valid' && best !== 'expiring') best = 'expired';
      continue;
    }
    if (d.status === 'valid') {
      if (d.expiryDate && d.expiryDate.getTime() <= soon) {
        best = 'expiring';
      } else {
        return 'valid';
      }
    }
  }
  return best === 'missing' ? 'unknown' : best;
}

export function pvsStatusScore(
  status: PvsVerificationStatus,
  exemptionFlag?: boolean,
): number {
  if (exemptionFlag || status === 'exempt') return 100;
  switch (status) {
    case 'verified':
      return 100;
    case 'in_review':
    case 'submitted':
      return 55;
    case 'draft':
      return 25;
    case 'rejected':
      return 10;
    case 'missing':
      return 0;
    default:
      return 0;
  }
}

/**
 * Score PVS coverage across required program categories (and any extras present).
 */
export function calculatePvsScore(
  programs: {
    programCategory: string;
    verificationStatus: PvsVerificationStatus;
    exemptionFlag?: boolean;
  }[],
): number {
  const required = requiredProgramCategories();
  const byCat = new Map(programs.map((p) => [p.programCategory, p]));

  if (!required.length && !programs.length) return 0;

  const scores: number[] = [];
  for (const cat of required) {
    const row = byCat.get(cat);
    if (!row) {
      scores.push(0);
      continue;
    }
    scores.push(pvsStatusScore(row.verificationStatus, row.exemptionFlag));
  }

  for (const p of programs) {
    if (required.includes(p.programCategory as (typeof required)[number])) continue;
    scores.push(pvsStatusScore(p.verificationStatus, p.exemptionFlag) * 0.5);
  }

  if (!scores.length) return 0;
  return clamp(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export type ComplianceBreakdown = {
  documentsScore: number;
  auditsScore: number;
  insuranceScore: number;
  pvsScore: number;
  complianceScore: number;
  weights: typeof COMPLIANCE_WEIGHTS;
  documentCount: number;
  auditCount: number;
  pvsCount: number;
  insuranceStatus: InsuranceStatus;
};

export function calculateContractorCompliance(input: {
  documents: { status: ContractorDocumentStatus; kind: string; expiryDate?: Date | null }[];
  audits: { result: ContractorAuditResult; score?: number | null }[];
  insuranceStatus?: InsuranceStatus;
  pvsPrograms?: {
    programCategory: string;
    verificationStatus: PvsVerificationStatus;
    exemptionFlag?: boolean;
  }[];
}): ComplianceBreakdown {
  const docs = input.documents;
  const audits = input.audits;
  const pvsPrograms = input.pvsPrograms ?? [];

  const documentsScore =
    docs.length === 0
      ? 0
      : clamp(
          docs.reduce((sum, d) => sum + documentStatusScore(d.status), 0) / docs.length,
        );

  const auditsScore =
    audits.length === 0
      ? 0
      : clamp(
          audits.reduce((sum, a) => sum + auditResultScore(a.result, a.score), 0) /
            audits.length,
        );

  const insuranceStatus =
    input.insuranceStatus ?? deriveInsuranceStatus(docs);
  const insuranceScore = insuranceStatusScore(insuranceStatus);
  const pvsScore = calculatePvsScore(pvsPrograms);

  const complianceScore = clamp(
    documentsScore * COMPLIANCE_WEIGHTS.documents +
      auditsScore * COMPLIANCE_WEIGHTS.audits +
      insuranceScore * COMPLIANCE_WEIGHTS.insurance +
      pvsScore * COMPLIANCE_WEIGHTS.pvs,
  );

  return {
    documentsScore,
    auditsScore,
    insuranceScore,
    pvsScore,
    complianceScore,
    weights: COMPLIANCE_WEIGHTS,
    documentCount: docs.length,
    auditCount: audits.length,
    pvsCount: pvsPrograms.length,
    insuranceStatus,
  };
}

/** Map compliance score → 0–5 safety rating for directory badges. */
export function safetyRatingFromCompliance(complianceScore: number): number {
  return Math.round((clamp(complianceScore) / 20) * 10) / 10;
}
