import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  DEFAULT_CONTRIBUTING_FACTORS,
  DEFAULT_ROOT_CAUSES,
} from './pm-safety-events.constants';

@Injectable()
export class PmSafetyEventsLibraryService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureLibraries(companyId: number) {
    for (const rc of DEFAULT_ROOT_CAUSES) {
      await this.prisma.pmRootCauseLibraryEntry.upsert({
        where: { companyId_code: { companyId, code: rc.code } },
        create: { companyId, ...rc },
        update: {},
      });
    }
    for (const cf of DEFAULT_CONTRIBUTING_FACTORS) {
      await this.prisma.pmContributingFactorLibraryEntry.upsert({
        where: { companyId_code: { companyId, code: cf.code } },
        create: { companyId, ...cf },
        update: {},
      });
    }
  }

  rootCauses(companyId: number) {
    return this.prisma.pmRootCauseLibraryEntry.findMany({
      where: { companyId, active: true },
      orderBy: { label: 'asc' },
    });
  }

  contributingFactors(companyId: number) {
    return this.prisma.pmContributingFactorLibraryEntry.findMany({
      where: { companyId, active: true },
      orderBy: { label: 'asc' },
    });
  }
}
