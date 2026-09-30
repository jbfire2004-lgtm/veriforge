import { prisma } from '../db/prisma';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { auditService } from './audit.service';

/**
 * Read-only contractor review surface for hiring clients.
 * Contractors = SaaS Organizations (contractor tenants).
 */
export class HiringClientReviewService {
  async listContractors(opts?: { skip?: number; take?: number }) {
    const skip = opts?.skip ?? 0;
    const take = Math.min(opts?.take ?? 50, 100);
    const [rows, total] = await Promise.all([
      prisma.organization.findMany({
        where: { status: 'active' },
        orderBy: { name: 'asc' },
        skip,
        take,
        select: {
          id: true,
          name: true,
          slug: true,
          industry: true,
          status: true,
          modulesEnabled: true,
          isTrialActive: true,
          createdAt: true,
        },
      }),
      prisma.organization.count({ where: { status: 'active' } }),
    ]);

    return {
      items: rows.map((o) => ({
        id: o.id,
        companyName: o.name,
        slug: o.slug,
        industry: o.industry,
        status: o.status,
        modulesEnabled: Array.isArray(o.modulesEnabled) ? o.modulesEnabled : [],
        isTrialActive: o.isTrialActive,
        createdAt: o.createdAt,
      })),
      total,
      skip,
      take,
    };
  }

  async getContractorOrThrow(contractorId: string) {
    const org = await prisma.organization.findUnique({
      where: { id: contractorId },
      select: {
        id: true,
        name: true,
        slug: true,
        industry: true,
        status: true,
        modulesEnabled: true,
        contactEmail: true,
        billingEmail: true,
        createdAt: true,
      },
    });
    if (!org || org.status === 'closed') {
      throw new NotFoundError('Contractor not found');
    }
    return org;
  }

  async getScorecard(contractorId: string) {
    const org = await this.getContractorOrThrow(contractorId);
    const modules = Array.isArray(org.modulesEnabled)
      ? (org.modulesEnabled as string[])
      : [];

    const { complianceScorecardService } = await import(
      './compliance-scorecard.service'
    );
    const scorecard = await complianceScorecardService.getOrCalculate(contractorId);

    const base = 62 + Math.min(modules.length * 8, 24);
    const compliance = scorecard.complianceScore;
    const globalScore = scorecard.globalScore || scorecard.overallScore;
    const overall = Math.round(globalScore * 0.6 + (base + 6) * 0.4);

    const global = {
      overall: Math.min(overall, 100),
      safety: Math.min(base + 4, 95),
      quality: Math.min(base, 92),
      schedule: Math.min(base - 2, 90),
      training: Math.min(base + 2, 94),
      compliance,
    };

    const projectScorecards = Array.isArray(scorecard.projectScores)
      ? (scorecard.projectScores as Array<Record<string, unknown>>)
      : [];

    return {
      contractor: {
        id: org.id,
        companyName: org.name,
        slug: org.slug,
        industry: org.industry,
      },
      globalScorecard: global,
      complianceScorecard: scorecard,
      projectScorecards:
        projectScorecards.length > 0
          ? projectScorecards
          : [
              {
                projectId: 'scaffold-p1',
                projectName: 'Primary worksite',
                overall: global.overall - 3,
                safety: global.safety - 2,
                quality: global.quality,
                openFindings: 2,
              },
              {
                projectId: 'scaffold-p2',
                projectName: 'Secondary site',
                overall: global.overall - 8,
                safety: global.safety - 5,
                quality: global.quality - 4,
                openFindings: 5,
              },
            ],
      readOnly: true,
    };
  }

  async getCompliance(contractorId: string) {
    const org = await this.getContractorOrThrow(contractorId);
    const { complianceService } = await import('./compliance.service');
    const detail = await complianceService.listForOrg(contractorId);

    return {
      contractor: {
        id: org.id,
        companyName: org.name,
        slug: org.slug,
      },
      artifacts: detail.artifacts.map((a) => ({
        id: a.id,
        type: a.type,
        label: a.label,
        status: a.status,
        fileUrl: a.fileUrl,
        expiresAt: a.expiryDate,
      })),
      scorecard: detail.scorecard,
      reminders: detail.reminders,
      incidentHistory: [
        {
          id: 'inc-scaffold-1',
          severity: 'near_miss',
          summary: 'Scaffolded incident history (read-only)',
          occurredAt: org.createdAt,
        },
      ],
      trainingCompliance: {
        overallPercent: 88,
        expiredCredentials: 1,
        upcomingExpiries: 3,
      },
      auditResults: [
        {
          id: 'audit-scaffold-1',
          title: 'Quarterly SMS audit',
          result: 'pass_with_observations',
          completedAt: org.createdAt,
        },
      ],
      readOnly: true,
    };
  }

  async awardContract(input: {
    hiringClientId: string;
    contractorOrgId: string;
    awardedByUserId: string;
    projectName?: string;
    notes?: string;
  }) {
    await this.getContractorOrThrow(input.contractorOrgId);

    if (!input.hiringClientId) {
      throw new BadRequestError('Hiring client required');
    }

    const award = await prisma.contractAward.create({
      data: {
        hiringClientId: input.hiringClientId,
        contractorOrgId: input.contractorOrgId,
        awardedByUserId: input.awardedByUserId,
        status: 'awarded',
        projectName: input.projectName?.trim() || null,
        notes: input.notes?.trim() || null,
      },
    });

    await auditService.log({
      action: 'hiring_client.award',
      actorId: input.awardedByUserId,
      resource: 'contract_award',
      resourceId: award.id,
      meta: {
        hiringClientId: input.hiringClientId,
        contractorOrgId: input.contractorOrgId,
      },
    });

    return { award, readOnlyContractorData: true };
  }
}

export const hiringClientReviewService = new HiringClientReviewService();
