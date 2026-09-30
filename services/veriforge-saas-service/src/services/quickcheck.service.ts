import type { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import { NotFoundError } from '../utils/errors';
import { contractorDirectoryService } from './contractor-directory.service';
import { documentCenterService } from './document-center.service';
import { programVerificationService } from './program-verification.service';
import { COMPLIANCE_WEIGHTS } from '../compliance/contractor-directory-score';
import {
  deriveRiskLevel,
  RISK_LEVEL_META,
  type QuickCheckMissingItem,
  type QuickCheckRiskLevel,
} from '../quickcheck/risk-levels';
import { requiredProgramCategories } from '../pvs/safety-matrix';
import { DOCUMENT_CATEGORIES, getCategoryRule } from '../document-center/category-rules';

export type QuickCheckResult = {
  runId: string;
  contractorId: string;
  complianceScore: number;
  riskLevel: QuickCheckRiskLevel;
  riskLabel: string;
  riskDescription: string;
  missingItems: QuickCheckMissingItem[];
  breakdown: {
    documentsScore: number;
    auditsScore: number;
    insuranceScore: number;
    pvsScore: number;
    insuranceStatus: string;
    weights: typeof COMPLIANCE_WEIGHTS;
    documentCount: number;
    auditCount: number;
    pvsCount: number;
  };
  checks: { id: string; label: string; ok: boolean; detail: string }[];
  source: string;
  generatedAt: string;
};

/**
 * QuickCheck — instant compliance snapshot from Documents, Audits, PVS, Insurance.
 */
export class QuickCheckService {
  async assertProfile(contractorId: string) {
    const profile = await prisma.contractorProfile.findUnique({
      where: { contractorId },
    });
    if (!profile) {
      throw new NotFoundError(
        'Contractor directory profile required — create profile first',
      );
    }
    return profile;
  }

  async run(input: {
    contractorId: string;
    triggeredById?: string;
    hiringClientId?: string;
    source?: string;
  }): Promise<QuickCheckResult> {
    await this.assertProfile(input.contractorId);
    const source = input.source || 'api';

    // Refresh stored compliance from all sources
    const recalc = await contractorDirectoryService.recalculateCompliance(
      input.contractorId,
    );
    const breakdown = recalc?.breakdown;
    if (!breakdown) {
      throw new NotFoundError('Unable to calculate compliance');
    }

    const missingItems = await this.collectMissingItems(input.contractorId);
    const riskLevel = deriveRiskLevel({
      complianceScore: breakdown.complianceScore,
      missingItems,
    });
    const meta = RISK_LEVEL_META[riskLevel];

    const checks = missingItems.map((m) => ({
      id: m.code,
      label: m.label,
      ok: false,
      detail: `${m.severity} · ${m.source}`,
    }));

    // Positive checks for healthy signals
    if (breakdown.insuranceStatus === 'valid') {
      checks.unshift({
        id: 'insurance:valid',
        label: 'Insurance valid',
        ok: true,
        detail: 'ok',
      });
    }
    if (breakdown.pvsScore >= 80) {
      checks.unshift({
        id: 'pvs:healthy',
        label: 'PVS coverage healthy',
        ok: true,
        detail: `score ${breakdown.pvsScore}`,
      });
    }
    if (breakdown.documentsScore >= 80) {
      checks.unshift({
        id: 'documents:healthy',
        label: 'Documents healthy',
        ok: true,
        detail: `score ${breakdown.documentsScore}`,
      });
    }
    if (breakdown.auditsScore >= 80) {
      checks.unshift({
        id: 'audits:healthy',
        label: 'Audits healthy',
        ok: true,
        detail: `score ${breakdown.auditsScore}`,
      });
    }

    const run = await prisma.quickCheckRun.create({
      data: {
        contractorId: input.contractorId,
        complianceScore: breakdown.complianceScore,
        riskLevel,
        breakdown: {
          documentsScore: breakdown.documentsScore,
          auditsScore: breakdown.auditsScore,
          insuranceScore: breakdown.insuranceScore,
          pvsScore: breakdown.pvsScore,
          insuranceStatus: breakdown.insuranceStatus,
          weights: breakdown.weights,
          documentCount: breakdown.documentCount,
          auditCount: breakdown.auditCount,
          pvsCount: breakdown.pvsCount,
        } as unknown as Prisma.InputJsonValue,
        missingItems: missingItems as unknown as Prisma.InputJsonValue,
        triggeredById: input.triggeredById,
        hiringClientId: input.hiringClientId,
        source,
      },
    });

    return {
      runId: run.id,
      contractorId: input.contractorId,
      complianceScore: breakdown.complianceScore,
      riskLevel,
      riskLabel: meta.label,
      riskDescription: meta.description,
      missingItems,
      breakdown: {
        documentsScore: breakdown.documentsScore,
        auditsScore: breakdown.auditsScore,
        insuranceScore: breakdown.insuranceScore,
        pvsScore: breakdown.pvsScore,
        insuranceStatus: breakdown.insuranceStatus,
        weights: breakdown.weights,
        documentCount: breakdown.documentCount,
        auditCount: breakdown.auditCount,
        pvsCount: breakdown.pvsCount,
      },
      checks,
      source,
      generatedAt: run.createdAt.toISOString(),
    };
  }

  async listRuns(contractorId: string, opts?: { skip?: number; take?: number }) {
    await this.assertProfile(contractorId);
    const skip = opts?.skip ?? 0;
    const take = Math.min(opts?.take ?? 20, 100);
    const [items, total] = await Promise.all([
      prisma.quickCheckRun.findMany({
        where: { contractorId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.quickCheckRun.count({ where: { contractorId } }),
    ]);
    return { items, total, skip, take };
  }

  async analytics(contractorId: string) {
    await this.assertProfile(contractorId);
    const since = new Date(Date.now() - 30 * 86_400_000);
    const runs = await prisma.quickCheckRun.findMany({
      where: { contractorId, createdAt: { gte: since } },
      orderBy: { createdAt: 'asc' },
    });
    const byRisk = { green: 0, yellow: 0, red: 0 };
    for (const r of runs) byRisk[r.riskLevel] += 1;
    const avgScore =
      runs.length === 0
        ? null
        : Math.round(
            runs.reduce((s, r) => s + r.complianceScore, 0) / runs.length,
          );
    return {
      contractorId,
      windowDays: 30,
      runCount: runs.length,
      avgScore,
      byRisk,
      latest: runs.length ? runs[runs.length - 1] : null,
      trend: runs.map((r) => ({
        at: r.createdAt.toISOString(),
        score: r.complianceScore,
        riskLevel: r.riskLevel,
        source: r.source,
      })),
    };
  }

  private async collectMissingItems(
    contractorId: string,
  ): Promise<QuickCheckMissingItem[]> {
    const missing: QuickCheckMissingItem[] = [];

    const profile = await prisma.contractorProfile.findUnique({
      where: { contractorId },
    });
    if (!profile) return missing;

    // Insurance
    if (
      profile.insuranceStatus === 'expired' ||
      profile.insuranceStatus === 'missing'
    ) {
      missing.push({
        code: 'insurance:status',
        label: `Insurance ${profile.insuranceStatus}`,
        severity: 'critical',
        source: 'insurance',
      });
    } else if (profile.insuranceStatus === 'expiring') {
      missing.push({
        code: 'insurance:expiring',
        label: 'Insurance expiring soon',
        severity: 'major',
        source: 'insurance',
      });
    }

    // Document Center
    let docDash: Awaited<ReturnType<typeof documentCenterService.dashboard>> | null =
      null;
    try {
      docDash = await documentCenterService.dashboard(contractorId);
    } catch {
      docDash = null;
    }

    if (docDash) {
      for (const cat of docDash.indicators.missingRequired) {
        const rule = getCategoryRule(cat);
        missing.push({
          code: `documents:missing:${cat}`,
          label: `Missing required document: ${rule.label}`,
          severity: 'critical',
          source: 'documents',
        });
      }
      if (docDash.totals.expired > 0) {
        missing.push({
          code: 'documents:expired',
          label: `${docDash.totals.expired} expired document(s)`,
          severity: 'critical',
          source: 'documents',
        });
      }
      if (docDash.totals.expiring > 0) {
        missing.push({
          code: 'documents:expiring',
          label: `${docDash.totals.expiring} document(s) expiring soon`,
          severity: 'major',
          source: 'documents',
        });
      }
    } else {
      // No Document Center activity — flag required categories as missing
      for (const cat of DOCUMENT_CATEGORIES) {
        const rule = getCategoryRule(cat);
        if (!rule.required) continue;
        missing.push({
          code: `documents:missing:${cat}`,
          label: `Missing required document: ${rule.label}`,
          severity: 'major',
          source: 'documents',
        });
      }
    }

    // Audits & Evaluation
    const openFindings = await prisma.auditFinding.count({
      where: { audit: { contractorId }, status: 'open' },
    });
    if (openFindings > 0) {
      missing.push({
        code: 'audits:open_findings',
        label: `${openFindings} open audit finding(s)`,
        severity: openFindings >= 3 ? 'critical' : 'major',
        source: 'audits',
      });
    }

    const scoredAudits = await prisma.evaluationAudit.count({
      where: {
        contractorId,
        status: { in: ['scored', 'closed'] },
      },
    });
    const failedAudits = await prisma.evaluationAudit.count({
      where: {
        contractorId,
        status: { in: ['scored', 'closed'] },
        score: { lt: 60 },
      },
    });
    if (scoredAudits === 0) {
      missing.push({
        code: 'audits:none',
        label: 'No scored evaluation audits',
        severity: 'minor',
        source: 'audits',
      });
    }
    if (failedAudits > 0) {
      missing.push({
        code: 'audits:failed',
        label: `${failedAudits} audit(s) scored below 60`,
        severity: 'critical',
        source: 'audits',
      });
    }

    const openCas = await prisma.correctiveAction.count({
      where: {
        audit: { contractorId },
        status: { in: ['open', 'in_progress', 'overdue'] },
      },
    });
    if (openCas > 0) {
      missing.push({
        code: 'audits:corrective_actions',
        label: `${openCas} open corrective action(s)`,
        severity: 'major',
        source: 'audits',
      });
    }

    // PVS
    let pvsDash: Awaited<
      ReturnType<typeof programVerificationService.dashboard>
    > | null = null;
    try {
      pvsDash = await programVerificationService.dashboard(contractorId);
    } catch {
      pvsDash = null;
    }

    if (pvsDash) {
      for (const cat of pvsDash.missingRequired) {
        missing.push({
          code: `pvs:missing:${cat}`,
          label: `PVS gap: ${cat.replace(/_/g, ' ')}`,
          severity: 'critical',
          source: 'pvs',
        });
      }
      if (pvsDash.indicators.hasPendingExemption) {
        missing.push({
          code: 'pvs:pending_exemption',
          label: 'Pending PVS exemption approval',
          severity: 'minor',
          source: 'pvs',
        });
      }
    } else {
      for (const cat of requiredProgramCategories()) {
        missing.push({
          code: `pvs:missing:${cat}`,
          label: `PVS gap: ${cat.replace(/_/g, ' ')}`,
          severity: 'major',
          source: 'pvs',
        });
      }
    }

    return missing;
  }
}

export const quickCheckService = new QuickCheckService();
