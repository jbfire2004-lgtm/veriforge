import { prisma } from '../db/prisma';
import { NotFoundError } from '../utils/errors';
import { auditService } from './audit.service';
import { complianceScorecardService } from './compliance-scorecard.service';

export class ScorecardService {
  async get(orgId: string) {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true, name: true, slug: true, industry: true, status: true },
    });
    if (!org || org.status === 'closed') {
      throw new NotFoundError('Organization not found');
    }

    const scorecard = await complianceScorecardService.getOrCalculate(orgId);

    return {
      organization: org,
      orgId: org.id,
      complianceScore: scorecard.complianceScore,
      complianceBreakdown: scorecard.complianceBreakdown,
      globalScore: scorecard.globalScore,
      overallScore: scorecard.overallScore,
      projectScores: scorecard.projectScores,
      calculatedAt: scorecard.calculatedAt,
      scorecard,
    };
  }

  async recalculate(orgId: string, actorId?: string) {
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org || org.status === 'closed') {
      throw new NotFoundError('Organization not found');
    }

    const scorecard = await complianceScorecardService.recalculate(orgId);

    if (actorId) {
      await auditService.log({
        action: 'scorecard.recalculate',
        orgId,
        actorId,
        resource: 'safety_scorecard',
        resourceId: scorecard.id,
        meta: {
          complianceScore: scorecard.complianceScore,
          globalScore: scorecard.globalScore,
          overallScore: scorecard.overallScore,
        },
      });
    }

    return {
      orgId,
      complianceScore: scorecard.complianceScore,
      complianceBreakdown: scorecard.complianceBreakdown,
      globalScore: scorecard.globalScore,
      overallScore: scorecard.overallScore,
      projectScores: scorecard.projectScores,
      calculatedAt: scorecard.calculatedAt,
      scorecard,
    };
  }
}

export const scorecardService = new ScorecardService();
