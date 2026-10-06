import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  TrainingRejectionCategory,
  TrainingRejectionSeverity,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CSA_STANDARDS_SEED,
  FEDERAL_OHS_SEED,
  INDUSTRY_COP_SEED,
  JURISDICTION_REQUIREMENTS_SEED,
  PROVINCIAL_OHS_SEED,
  REJECTION_REASONS_SEED,
} from './data/standards-catalog.seed';

@Injectable()
export class StandardsCatalogService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedIfEmpty();
  }

  async seedIfEmpty() {
    const count = await this.prisma.trainingStandard.count();
    if (count > 0) return;

    const allStandards = [
      ...CSA_STANDARDS_SEED,
      ...FEDERAL_OHS_SEED,
      ...PROVINCIAL_OHS_SEED,
      ...INDUSTRY_COP_SEED,
    ];

    for (const s of allStandards) {
      await this.prisma.trainingStandard.upsert({
        where: { code: s.code },
        create: {
          code: s.code,
          title: s.title,
          kind: s.kind,
          jurisdictionCode: 'jurisdictionCode' in s ? s.jurisdictionCode : null,
          keywords: s.keywords,
          defaultValidityDays: s.defaultValidityDays,
        },
        update: {},
      });
    }

    for (const r of REJECTION_REASONS_SEED) {
      await this.prisma.trainingRejectionReason.upsert({
        where: { code: r.code },
        create: {
          code: r.code,
          title: r.title,
          category: r.category as TrainingRejectionCategory,
          severity: r.severity as TrainingRejectionSeverity,
        },
        update: {},
      });
    }

    for (const j of JURISDICTION_REQUIREMENTS_SEED) {
      const existing = await this.prisma.jurisdictionRequirement.findFirst({
        where: {
          jurisdictionCode: j.jurisdictionCode,
          standardCode: j.standardCode,
          tradeCode: null,
        },
      });
      if (!existing) {
        await this.prisma.jurisdictionRequirement.create({
          data: {
            jurisdictionCode: j.jurisdictionCode,
            regionName: j.regionName,
            standardCode: j.standardCode,
            required: j.required,
          },
        });
      }
    }

    const globalRule = await this.prisma.providerQualificationRule.findFirst({
      where: { trainingProviderId: null, ruleKey: 'GLOBAL_DEFAULT' },
    });
    if (!globalRule) {
      await this.prisma.providerQualificationRule.create({
        data: {
          ruleKey: 'GLOBAL_DEFAULT',
          description: 'Default provider must be approved',
          requiredApprovalStatus: 'APPROVED',
          requiredStandardCodes: ['CSA-Z1001'],
        },
      });
    }

    const globalInstructor =
      await this.prisma.instructorQualificationRule.findFirst({
        where: { trainingProviderId: null, ruleKey: 'GLOBAL_INSTRUCTOR' },
      });
    if (!globalInstructor) {
      await this.prisma.instructorQualificationRule.create({
        data: {
          ruleKey: 'GLOBAL_INSTRUCTOR',
          description:
            'Instructors must hold a license when delivering equipment training',
          requiresLicense: false,
          requiredStandardCodes: [],
        },
      });
    }
  }

  listStandards() {
    return this.prisma.trainingStandard.findMany({
      where: { active: true },
      orderBy: [{ kind: 'asc' }, { code: 'asc' }],
    });
  }

  listRejectionReasons() {
    return this.prisma.trainingRejectionReason.findMany({
      where: { active: true },
      orderBy: { code: 'asc' },
    });
  }
}
