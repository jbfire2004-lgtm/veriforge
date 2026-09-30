import type {
  ComplianceArtifact,
  ComplianceArtifactStatus,
  ComplianceArtifactType,
} from '@prisma/client';
import { prisma } from '../db/prisma';
import {
  COMPLIANCE_BASE_SCORE,
  COMPLIANCE_EXPIRING_SOON_DAYS,
  COMPLIANCE_TYPE_WEIGHTS,
  REQUIRED_COMPLIANCE_TYPES,
  type RequiredComplianceType,
  type TypeComplianceBucket,
} from '../compliance/weights';

export type ComplianceBucket =
  | 'valid'
  | 'expiring'
  | 'expiring_soon'
  | 'expired'
  | 'missing'
  | 'pending_review'
  | 'rejected'
  | 'active'
  | 'inactive';

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function isExpiredByDate(
  artifact: Pick<ComplianceArtifact, 'expiryDate'>,
  now: Date,
): boolean {
  return Boolean(artifact.expiryDate && artifact.expiryDate.getTime() < now.getTime());
}

function isExpiringSoon(
  artifact: Pick<ComplianceArtifact, 'expiryDate'>,
  now: Date,
): boolean {
  if (!artifact.expiryDate) return false;
  const ms = artifact.expiryDate.getTime() - now.getTime();
  if (ms < 0) return false;
  return ms / 86_400_000 <= COMPLIANCE_EXPIRING_SOON_DAYS;
}

export function classifyForType(
  type: RequiredComplianceType,
  artifact: Pick<ComplianceArtifact, 'status' | 'expiryDate'> | null,
  now = new Date(),
): TypeComplianceBucket {
  if (!artifact) {
    if (type === 'scsa') return 'inactive';
    return 'missing';
  }

  if (type === 'scsa') {
    if (artifact.status === 'valid' && !isExpiredByDate(artifact, now)) {
      return 'active';
    }
    return 'inactive';
  }

  if (artifact.status === 'rejected') return 'rejected';
  if (artifact.status === 'pending_review') return 'pending_review';
  if (artifact.status === 'expired' || isExpiredByDate(artifact, now)) {
    return 'expired';
  }

  if (type === 'insurance' && isExpiringSoon(artifact, now)) {
    return 'expiring';
  }

  if (artifact.status === 'valid') return 'valid';
  return 'pending_review';
}

export function weightForTypeBucket(
  type: RequiredComplianceType,
  bucket: TypeComplianceBucket,
): number {
  const table = COMPLIANCE_TYPE_WEIGHTS[type];
  return (table as Record<string, number>)[bucket] ?? 0;
}

/**
 * Pick the best current artifact per type (prefer valid, then newest).
 */
export function pickLatestByType(
  artifacts: ComplianceArtifact[],
): Map<ComplianceArtifactType, ComplianceArtifact> {
  const map = new Map<ComplianceArtifactType, ComplianceArtifact>();
  const rank: Record<ComplianceArtifactStatus, number> = {
    valid: 4,
    pending_review: 3,
    rejected: 2,
    expired: 1,
  };
  for (const a of artifacts) {
    const prev = map.get(a.type);
    if (!prev) {
      map.set(a.type, a);
      continue;
    }
    const ra = rank[a.status] ?? 0;
    const rp = rank[prev.status] ?? 0;
    if (ra > rp || (ra === rp && a.updatedAt > prev.updatedAt)) {
      map.set(a.type, a);
    }
  }
  return map;
}

export class ComplianceScorecardService {
  /**
   * Batch recalculate scorecards for all orgs that have artifacts or an existing scorecard.
   */
  async recalculateAll(opts?: { take?: number }) {
    const take = Math.min(opts?.take ?? 2_000, 5_000);
    const [withArtifacts, withScorecards] = await Promise.all([
      prisma.complianceArtifact.findMany({
        select: { orgId: true },
        distinct: ['orgId'],
        take,
      }),
      prisma.scorecard.findMany({
        select: { orgId: true },
        take,
      }),
    ]);

    const orgIds = [
      ...new Set([
        ...withArtifacts.map((r) => r.orgId),
        ...withScorecards.map((r) => r.orgId),
      ]),
    ];

    let updated = 0;
    for (const orgId of orgIds) {
      await this.recalculate(orgId);
      updated += 1;
    }

    return { orgs: orgIds.length, updated };
  }

  async recalculate(orgId: string) {
    const artifacts = await prisma.complianceArtifact.findMany({
      where: { orgId },
      orderBy: { updatedAt: 'desc' },
    });
    const byType = pickLatestByType(artifacts);
    const now = new Date();

    const typeBreakdown: Record<
      string,
      {
        bucket: TypeComplianceBucket;
        weight: number;
        artifactId: string | null;
        rules: typeof COMPLIANCE_TYPE_WEIGHTS[RequiredComplianceType];
      }
    > = {};

    let complianceDelta = 0;
    for (const type of REQUIRED_COMPLIANCE_TYPES) {
      const art = byType.get(type) ?? null;
      const bucket = classifyForType(type, art, now);
      const weight = weightForTypeBucket(type, bucket);
      complianceDelta += weight;
      typeBreakdown[type] = {
        bucket,
        weight,
        artifactId: art?.id ?? null,
        rules: COMPLIANCE_TYPE_WEIGHTS[type],
      };
    }

    const customs = artifacts.filter((a) => a.type === 'custom');
    let customDelta = 0;
    for (const c of customs.slice(0, 5)) {
      const bucket = classifyForType('insurance', c, now);
      if (bucket === 'valid') customDelta += 2;
      if (bucket === 'expired') customDelta -= 2;
    }

    const complianceScore = clamp(
      COMPLIANCE_BASE_SCORE + complianceDelta + customDelta,
    );

    const overallScore = clamp(Math.round(complianceScore * 0.7 + 50 * 0.3));
    const globalScore = overallScore;

    const complianceBreakdown = {
      base: COMPLIANCE_BASE_SCORE,
      required: typeBreakdown,
      customDelta,
      complianceDelta,
      weights: COMPLIANCE_TYPE_WEIGHTS,
      calculatedAt: now.toISOString(),
    };

    // Scaffold project slices until project-scoped scoring lands.
    const projectScores = [
      {
        projectId: 'scaffold-p1',
        projectName: 'Primary worksite',
        overall: Math.max(0, globalScore - 3),
        safety: Math.max(0, globalScore - 2),
        compliance: complianceScore,
      },
      {
        projectId: 'scaffold-p2',
        projectName: 'Secondary site',
        overall: Math.max(0, globalScore - 8),
        safety: Math.max(0, globalScore - 5),
        compliance: complianceScore,
      },
    ];

    const previous = await prisma.scorecard.findUnique({
      where: { orgId },
      select: { globalScore: true },
    });

    const row = await prisma.scorecard.upsert({
      where: { orgId },
      create: {
        orgId,
        complianceScore,
        overallScore,
        globalScore,
        complianceBreakdown,
        projectScores,
        calculatedAt: now,
      },
      update: {
        complianceScore,
        overallScore,
        globalScore,
        complianceBreakdown,
        projectScores,
        calculatedAt: now,
      },
    });

    const { notificationTriggers } = await import('./notification-triggers.service');
    await notificationTriggers
      .onScorecardUpdate({
        orgId,
        globalScore,
        complianceScore,
        previousGlobalScore: previous?.globalScore ?? null,
      })
      .catch(() => undefined);

    return row;
  }

  async getOrCalculate(orgId: string) {
    const existing = await prisma.scorecard.findUnique({
      where: { orgId },
    });
    if (
      existing &&
      Date.now() - existing.calculatedAt.getTime() < 5 * 60_000
    ) {
      return existing;
    }
    return this.recalculate(orgId);
  }
}

export const complianceScorecardService = new ComplianceScorecardService();
