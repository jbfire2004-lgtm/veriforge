import type { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';
import { COMPLIANCE_WEIGHTS } from '../compliance/contractor-directory-score';

export type AnalyticsScope = 'contractor' | 'client' | 'admin';

export type AnalyticsQuery = {
  scope: AnalyticsScope;
  /** Contractor org id — required for contractor scope; optional filter for admin/client */
  contractorId?: string;
  hiringClientId?: string;
  from?: Date;
  to?: Date;
  skip?: number;
  take?: number;
  region?: string;
  q?: string;
};

function parseRange(from?: Date, to?: Date) {
  const end = to ?? new Date();
  const start =
    from ?? new Date(end.getTime() - 30 * 86_400_000);
  if (start.getTime() > end.getTime()) {
    throw new BadRequestError('from must be before to');
  }
  return { from: start, to: end };
}

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

/**
 * Analytics Dashboard aggregation — Directory, Documents, Audits, PVS, QuickCheck.
 */
export class AnalyticsDashboardService {
  async getDashboard(query: AnalyticsQuery) {
    const range = parseRange(query.from, query.to);
    const skip = query.skip ?? 0;
    const take = Math.min(query.take ?? 20, 100);

    if (query.scope === 'contractor') {
      if (!query.contractorId) {
        throw new BadRequestError('contractorId required for contractor scope');
      }
      return this.contractorDashboard(query.contractorId, range, skip, take);
    }
    if (query.scope === 'client') {
      if (!query.hiringClientId) {
        throw new BadRequestError('hiringClientId required for client scope');
      }
      return this.clientDashboard(query.hiringClientId, range, skip, take, {
        region: query.region,
        q: query.q,
        contractorId: query.contractorId,
      });
    }
    return this.adminDashboard(range, skip, take, {
      region: query.region,
      q: query.q,
      contractorId: query.contractorId,
    });
  }

  private async contractorDashboard(
    contractorId: string,
    range: { from: Date; to: Date },
    skip: number,
    take: number,
  ) {
    const profile = await prisma.contractorProfile.findUnique({
      where: { contractorId },
    });
    if (!profile) throw new NotFoundError('Contractor profile not found');

    const [
      docs,
      evalAudits,
      pvs,
      qcRuns,
      openFindings,
      openCas,
      docExpiry,
      auditTrend,
    ] = await Promise.all([
      prisma.documentCenterDocument.findMany({ where: { contractorId } }),
      prisma.evaluationAudit.findMany({
        where: {
          contractorId,
          updatedAt: { gte: range.from, lte: range.to },
        },
        orderBy: { updatedAt: 'asc' },
      }),
      prisma.programVerification.findMany({ where: { contractorId } }),
      prisma.quickCheckRun.findMany({
        where: {
          contractorId,
          createdAt: { gte: range.from, lte: range.to },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.auditFinding.count({
        where: { audit: { contractorId }, status: 'open' },
      }),
      prisma.correctiveAction.count({
        where: {
          audit: { contractorId },
          status: { in: ['open', 'in_progress', 'overdue'] },
        },
      }),
      prisma.documentCenterDocument.findMany({
        where: {
          contractorId,
          expiryDate: { not: null },
        },
        select: { expiryDate: true, status: true, category: true, title: true },
      }),
      prisma.evaluationAudit.findMany({
        where: {
          contractorId,
          status: { in: ['scored', 'closed'] },
          completedAt: { gte: range.from, lte: range.to },
        },
        orderBy: { completedAt: 'asc' },
        select: { completedAt: true, score: true, title: true, status: true },
      }),
    ]);

    const kpis = this.buildKpis({
      profiles: [profile],
      docs,
      pvs,
      qcRuns,
      openFindings,
      openCas,
      evalAuditsInRange: evalAudits.length,
    });

    const documentExpiry = this.documentExpiryStats(docExpiry, range);
    const auditTrends = this.auditTrendSeries(auditTrend, range);
    const pvsCoverage = this.pvsCoverage(pvs);
    const insurance = this.insuranceBreakdown([profile]);
    const quickCheckRisk = this.quickCheckDistribution(qcRuns);

    return {
      scope: 'contractor' as const,
      range: { from: range.from.toISOString(), to: range.to.toISOString() },
      weights: COMPLIANCE_WEIGHTS,
      kpis,
      charts: {
        documentExpiry,
        auditTrends,
        pvsCoverage,
        insuranceCompliance: insurance,
        quickCheckRisk,
        complianceBreakdown: [
          { key: 'documents', label: 'Documents', value: kpis.avgDocumentsScore },
          { key: 'audits', label: 'Audits', value: kpis.avgAuditsScore },
          { key: 'insurance', label: 'Insurance', value: kpis.avgInsuranceScore },
          { key: 'pvs', label: 'PVS', value: kpis.avgPvsScore },
        ],
      },
      contractors: {
        items: [
          {
            contractorId: profile.contractorId,
            legalName: profile.legalName,
            tradeName: profile.tradeName,
            complianceScore: profile.complianceScore,
            insuranceStatus: profile.insuranceStatus,
            safetyRating: profile.safetyRating,
            region: profile.region,
          },
        ],
        total: 1,
        skip: 0,
        take: 1,
      },
      recentQuickChecks: qcRuns
        .slice()
        .reverse()
        .slice(skip, skip + take)
        .map((r) => ({
          id: r.id,
          contractorId: r.contractorId,
          complianceScore: r.complianceScore,
          riskLevel: r.riskLevel,
          source: r.source,
          createdAt: r.createdAt.toISOString(),
        })),
    };
  }

  private async clientDashboard(
    hiringClientId: string,
    range: { from: Date; to: Date },
    skip: number,
    take: number,
    filters: { region?: string; q?: string; contractorId?: string },
  ) {
    const connections = await prisma.contractorConnection.findMany({
      where: {
        hiringClientId,
        status: 'approved',
        ...(filters.contractorId
          ? { contractorId: filters.contractorId }
          : {}),
      },
      select: { contractorId: true },
    });
    const ids = connections.map((c) => c.contractorId);
    return this.aggregateForContractors(ids, range, skip, take, filters, 'client');
  }

  private async adminDashboard(
    range: { from: Date; to: Date },
    skip: number,
    take: number,
    filters: { region?: string; q?: string; contractorId?: string },
  ) {
    const where: Prisma.ContractorProfileWhereInput = {
      isListed: true,
      ...(filters.contractorId ? { contractorId: filters.contractorId } : {}),
      ...(filters.region
        ? { region: { contains: filters.region, mode: 'insensitive' } }
        : {}),
      ...(filters.q
        ? {
            OR: [
              { legalName: { contains: filters.q, mode: 'insensitive' } },
              { tradeName: { contains: filters.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const profiles = await prisma.contractorProfile.findMany({
      where,
      select: { contractorId: true },
      take: 5000,
    });
    const ids = profiles.map((p) => p.contractorId);
    return this.aggregateForContractors(ids, range, skip, take, filters, 'admin');
  }

  private async aggregateForContractors(
    contractorIds: string[],
    range: { from: Date; to: Date },
    skip: number,
    take: number,
    filters: { region?: string; q?: string },
    scope: 'client' | 'admin',
  ) {
    if (!contractorIds.length) {
      return this.emptyDashboard(scope, range, skip, take);
    }

    const profileWhere: Prisma.ContractorProfileWhereInput = {
      contractorId: { in: contractorIds },
      ...(filters.region
        ? { region: { contains: filters.region, mode: 'insensitive' } }
        : {}),
      ...(filters.q
        ? {
            OR: [
              { legalName: { contains: filters.q, mode: 'insensitive' } },
              { tradeName: { contains: filters.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [profiles, total, docs, pvs, qcRuns, evalAudits, openFindings, openCas] =
      await Promise.all([
        prisma.contractorProfile.findMany({
          where: profileWhere,
          orderBy: { complianceScore: 'desc' },
          skip,
          take,
        }),
        prisma.contractorProfile.count({ where: profileWhere }),
        prisma.documentCenterDocument.findMany({
          where: { contractorId: { in: contractorIds } },
        }),
        prisma.programVerification.findMany({
          where: { contractorId: { in: contractorIds } },
        }),
        prisma.quickCheckRun.findMany({
          where: {
            contractorId: { in: contractorIds },
            createdAt: { gte: range.from, lte: range.to },
          },
          orderBy: { createdAt: 'asc' },
        }),
        prisma.evaluationAudit.findMany({
          where: {
            contractorId: { in: contractorIds },
            status: { in: ['scored', 'closed'] },
            completedAt: { gte: range.from, lte: range.to },
          },
          orderBy: { completedAt: 'asc' },
          select: {
            contractorId: true,
            completedAt: true,
            score: true,
            title: true,
            status: true,
          },
        }),
        prisma.auditFinding.count({
          where: {
            audit: { contractorId: { in: contractorIds } },
            status: 'open',
          },
        }),
        prisma.correctiveAction.count({
          where: {
            audit: { contractorId: { in: contractorIds } },
            status: { in: ['open', 'in_progress', 'overdue'] },
          },
        }),
      ]);

    const allProfiles = await prisma.contractorProfile.findMany({
      where: profileWhere,
    });

    const kpis = this.buildKpis({
      profiles: allProfiles,
      docs,
      pvs,
      qcRuns,
      openFindings,
      openCas,
      evalAuditsInRange: evalAudits.length,
    });

    return {
      scope,
      range: { from: range.from.toISOString(), to: range.to.toISOString() },
      weights: COMPLIANCE_WEIGHTS,
      kpis,
      charts: {
        documentExpiry: this.documentExpiryStats(
          docs.filter((d) => d.expiryDate),
          range,
        ),
        auditTrends: this.auditTrendSeries(evalAudits, range),
        pvsCoverage: this.pvsCoverage(pvs),
        insuranceCompliance: this.insuranceBreakdown(allProfiles),
        quickCheckRisk: this.quickCheckDistribution(qcRuns),
        complianceBreakdown: [
          { key: 'documents', label: 'Documents', value: kpis.avgDocumentsScore },
          { key: 'audits', label: 'Audits', value: kpis.avgAuditsScore },
          { key: 'insurance', label: 'Insurance', value: kpis.avgInsuranceScore },
          { key: 'pvs', label: 'PVS', value: kpis.avgPvsScore },
        ],
        complianceHistogram: this.complianceHistogram(allProfiles),
      },
      contractors: {
        items: profiles.map((p) => ({
          contractorId: p.contractorId,
          legalName: p.legalName,
          tradeName: p.tradeName,
          complianceScore: p.complianceScore,
          insuranceStatus: p.insuranceStatus,
          safetyRating: p.safetyRating,
          region: p.region,
        })),
        total,
        skip,
        take,
        page: Math.floor(skip / take) + 1,
        pageCount: Math.max(1, Math.ceil(total / take)),
      },
      recentQuickChecks: qcRuns
        .slice()
        .reverse()
        .slice(0, 10)
        .map((r) => ({
          id: r.id,
          contractorId: r.contractorId,
          complianceScore: r.complianceScore,
          riskLevel: r.riskLevel,
          source: r.source,
          createdAt: r.createdAt.toISOString(),
        })),
    };
  }

  private emptyDashboard(
    scope: AnalyticsScope,
    range: { from: Date; to: Date },
    skip: number,
    take: number,
  ) {
    return {
      scope,
      range: { from: range.from.toISOString(), to: range.to.toISOString() },
      weights: COMPLIANCE_WEIGHTS,
      kpis: {
        contractorCount: 0,
        avgComplianceScore: 0,
        avgDocumentsScore: 0,
        avgAuditsScore: 0,
        avgInsuranceScore: 0,
        avgPvsScore: 0,
        documentsTotal: 0,
        documentsExpired: 0,
        documentsExpiring: 0,
        auditsInRange: 0,
        openFindings: 0,
        openCorrectiveActions: 0,
        pvsVerified: 0,
        pvsTotal: 0,
        pvsCoveragePct: 0,
        quickCheckRuns: 0,
        riskGreen: 0,
        riskYellow: 0,
        riskRed: 0,
      },
      charts: {
        documentExpiry: { labels: [], expired: [], expiring: [], valid: [] },
        auditTrends: { labels: [], avgScore: [], count: [] },
        pvsCoverage: { labels: [], verified: [], other: [] },
        insuranceCompliance: { labels: [], values: [] },
        quickCheckRisk: { labels: ['green', 'yellow', 'red'], values: [0, 0, 0] },
        complianceBreakdown: [],
        complianceHistogram: { labels: [], values: [] },
      },
      contractors: { items: [], total: 0, skip, take, page: 1, pageCount: 1 },
      recentQuickChecks: [],
    };
  }

  private buildKpis(input: {
    profiles: {
      complianceScore: number;
      insuranceStatus: string;
    }[];
    docs: { status: string }[];
    pvs: { verificationStatus: string; exemptionFlag: boolean }[];
    qcRuns: { riskLevel: string; complianceScore: number }[];
    openFindings: number;
    openCas: number;
    evalAuditsInRange: number;
  }) {
    const n = input.profiles.length || 1;
    const avgComplianceScore = Math.round(
      input.profiles.reduce((s, p) => s + p.complianceScore, 0) /
        (input.profiles.length || 1),
    );

    // Approximate component scores from stored compliance when we lack per-profile breakdown
    const insuranceValid = input.profiles.filter(
      (p) => p.insuranceStatus === 'valid',
    ).length;
    const avgInsuranceScore = Math.round((insuranceValid / n) * 100);

    const docsExpired = input.docs.filter((d) => d.status === 'expired').length;
    const docsExpiring = input.docs.filter((d) => d.status === 'expiring').length;
    const docsValid = input.docs.filter(
      (d) => d.status === 'valid' || d.status === 'exempt' || d.status === 'expiring',
    ).length;
    const avgDocumentsScore =
      input.docs.length === 0
        ? 0
        : Math.round((docsValid / input.docs.length) * 100);

    const pvsOk = input.pvs.filter(
      (p) =>
        p.exemptionFlag ||
        p.verificationStatus === 'verified' ||
        p.verificationStatus === 'exempt',
    ).length;
    const avgPvsScore =
      input.pvs.length === 0
        ? 0
        : Math.round((pvsOk / input.pvs.length) * 100);

    // Derive audits score roughly from compliance residual
    const avgAuditsScore = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          (avgComplianceScore -
            avgDocumentsScore * COMPLIANCE_WEIGHTS.documents -
            avgInsuranceScore * COMPLIANCE_WEIGHTS.insurance -
            avgPvsScore * COMPLIANCE_WEIGHTS.pvs) /
            COMPLIANCE_WEIGHTS.audits,
        ),
      ),
    );

    const riskGreen = input.qcRuns.filter((r) => r.riskLevel === 'green').length;
    const riskYellow = input.qcRuns.filter((r) => r.riskLevel === 'yellow').length;
    const riskRed = input.qcRuns.filter((r) => r.riskLevel === 'red').length;

    return {
      contractorCount: input.profiles.length,
      avgComplianceScore,
      avgDocumentsScore,
      avgAuditsScore,
      avgInsuranceScore,
      avgPvsScore,
      documentsTotal: input.docs.length,
      documentsExpired: docsExpired,
      documentsExpiring: docsExpiring,
      auditsInRange: input.evalAuditsInRange,
      openFindings: input.openFindings,
      openCorrectiveActions: input.openCas,
      pvsVerified: pvsOk,
      pvsTotal: input.pvs.length,
      pvsCoveragePct: avgPvsScore,
      quickCheckRuns: input.qcRuns.length,
      riskGreen,
      riskYellow,
      riskRed,
    };
  }

  private documentExpiryStats(
    docs: { expiryDate: Date | null; status: string }[],
    range: { from: Date; to: Date },
  ) {
    const labels: string[] = [];
    const expired: number[] = [];
    const expiring: number[] = [];
    const valid: number[] = [];
    const cursor = new Date(range.from);
    cursor.setUTCHours(0, 0, 0, 0);
    const end = new Date(range.to);
    end.setUTCHours(0, 0, 0, 0);

    // Weekly buckets for readability
    while (cursor.getTime() <= end.getTime()) {
      const weekStart = new Date(cursor);
      const weekEnd = new Date(cursor.getTime() + 7 * 86_400_000);
      labels.push(dayKey(weekStart));
      let e = 0;
      let x = 0;
      let v = 0;
      for (const d of docs) {
        if (!d.expiryDate) continue;
        const t = d.expiryDate.getTime();
        if (t >= weekStart.getTime() && t < weekEnd.getTime()) {
          if (d.status === 'expired') e += 1;
          else if (d.status === 'expiring') x += 1;
          else v += 1;
        }
      }
      expired.push(e);
      expiring.push(x);
      valid.push(v);
      cursor.setTime(weekEnd.getTime());
    }
    return { labels, expired, expiring, valid };
  }

  private auditTrendSeries(
    audits: { completedAt: Date | null; score: number | null }[],
    range: { from: Date; to: Date },
  ) {
    const byDay = new Map<string, { sum: number; n: number }>();
    for (const a of audits) {
      if (!a.completedAt || a.score == null) continue;
      const k = dayKey(a.completedAt);
      const cur = byDay.get(k) || { sum: 0, n: 0 };
      cur.sum += a.score;
      cur.n += 1;
      byDay.set(k, cur);
    }
    const labels: string[] = [];
    const avgScore: number[] = [];
    const count: number[] = [];
    const cursor = new Date(range.from);
    cursor.setUTCHours(0, 0, 0, 0);
    const end = new Date(range.to);
    while (cursor.getTime() <= end.getTime()) {
      const k = dayKey(cursor);
      labels.push(k);
      const cur = byDay.get(k);
      avgScore.push(cur ? Math.round(cur.sum / cur.n) : 0);
      count.push(cur?.n ?? 0);
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    // Downsample long ranges to ~30 points
    if (labels.length > 45) {
      return this.downsample(labels, avgScore, count, 30);
    }
    return { labels, avgScore, count };
  }

  private downsample(
    labels: string[],
    avgScore: number[],
    count: number[],
    maxPoints: number,
  ) {
    const step = Math.ceil(labels.length / maxPoints);
    const outL: string[] = [];
    const outA: number[] = [];
    const outC: number[] = [];
    for (let i = 0; i < labels.length; i += step) {
      outL.push(labels[i]!);
      let s = 0;
      let c = 0;
      let n = 0;
      for (let j = i; j < Math.min(i + step, labels.length); j++) {
        s += avgScore[j]!;
        c += count[j]!;
        n += 1;
      }
      outA.push(n ? Math.round(s / n) : 0);
      outC.push(c);
    }
    return { labels: outL, avgScore: outA, count: outC };
  }

  private pvsCoverage(
    pvs: { programCategory: string; verificationStatus: string; exemptionFlag: boolean }[],
  ) {
    const byCat = new Map<string, { verified: number; other: number }>();
    for (const p of pvs) {
      const cur = byCat.get(p.programCategory) || { verified: 0, other: 0 };
      if (
        p.exemptionFlag ||
        p.verificationStatus === 'verified' ||
        p.verificationStatus === 'exempt'
      ) {
        cur.verified += 1;
      } else cur.other += 1;
      byCat.set(p.programCategory, cur);
    }
    const labels = [...byCat.keys()].map((k) => k.replace(/_/g, ' '));
    const verified = [...byCat.values()].map((v) => v.verified);
    const other = [...byCat.values()].map((v) => v.other);
    return { labels, verified, other };
  }

  private insuranceBreakdown(
    profiles: { insuranceStatus: string }[],
  ) {
    const counts: Record<string, number> = {
      valid: 0,
      expiring: 0,
      expired: 0,
      missing: 0,
      unknown: 0,
    };
    for (const p of profiles) {
      counts[p.insuranceStatus] = (counts[p.insuranceStatus] ?? 0) + 1;
    }
    return {
      labels: Object.keys(counts),
      values: Object.values(counts),
    };
  }

  private quickCheckDistribution(
    runs: { riskLevel: string }[],
  ) {
    const counts = { green: 0, yellow: 0, red: 0 };
    for (const r of runs) {
      if (r.riskLevel === 'green' || r.riskLevel === 'yellow' || r.riskLevel === 'red') {
        counts[r.riskLevel] += 1;
      }
    }
    return {
      labels: ['green', 'yellow', 'red'],
      values: [counts.green, counts.yellow, counts.red],
    };
  }

  private complianceHistogram(
    profiles: { complianceScore: number }[],
  ) {
    const buckets = ['0-19', '20-39', '40-59', '60-79', '80-100'];
    const values = [0, 0, 0, 0, 0];
    for (const p of profiles) {
      const s = p.complianceScore;
      const idx =
        s < 20 ? 0 : s < 40 ? 1 : s < 60 ? 2 : s < 80 ? 3 : 4;
      values[idx]! += 1;
    }
    return { labels: buckets, values };
  }

  assertContractorAccess(orgId: string | undefined, contractorId: string) {
    if (!orgId || orgId !== contractorId) {
      throw new ForbiddenError('Contractor access required');
    }
  }
}

export const analyticsDashboardService = new AnalyticsDashboardService();
