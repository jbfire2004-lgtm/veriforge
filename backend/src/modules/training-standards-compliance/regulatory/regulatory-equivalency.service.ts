import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { REGULATORY_EQUIVALENCY_SEED } from './regulatory-equivalency.seed';

@Injectable()
export class RegulatoryEquivalencyService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedIfEmpty();
  }

  async seedIfEmpty() {
    const count = await this.prisma.regulatoryEquivalency.count();
    if (count > 0) return;
    for (const row of REGULATORY_EQUIVALENCY_SEED) {
      await this.prisma.regulatoryEquivalency.upsert({
        where: {
          fromJurisdiction_toJurisdiction_standardCode: {
            fromJurisdiction: row.fromJurisdiction,
            toJurisdiction: row.toJurisdiction,
            standardCode: row.standardCode,
          },
        },
        create: {
          fromJurisdiction: row.fromJurisdiction,
          toJurisdiction: row.toJurisdiction,
          standardCode: row.standardCode,
          notes: row.notes,
        },
        update: { active: true, notes: row.notes },
      });
    }
  }

  /**
   * Jurisdictions where matched standards from `sourceJurisdiction` are accepted
   * (includes source + explicit equivalency targets).
   */
  async resolveJurisdictionCoverage(
    sourceJurisdiction: string,
    matchedStandardCodes: string[],
  ): Promise<string[]> {
    const source = sourceJurisdiction.trim().toUpperCase();
    const codes = [...new Set(matchedStandardCodes.filter(Boolean))];
    const coverage = new Set<string>([source, 'CA-FED']);

    if (codes.length === 0) return [...coverage];

    const rows = await this.prisma.regulatoryEquivalency.findMany({
      where: {
        active: true,
        fromJurisdiction: source,
        standardCode: { in: codes },
      },
      select: { toJurisdiction: true, standardCode: true },
    });

    for (const r of rows) {
      coverage.add(r.toJurisdiction);
    }

    // Reverse: training evaluated in target may accept source issuance
    const inbound = await this.prisma.regulatoryEquivalency.findMany({
      where: {
        active: true,
        toJurisdiction: source,
        standardCode: { in: codes },
      },
      select: { fromJurisdiction: true },
    });
    for (const r of inbound) {
      coverage.add(r.fromJurisdiction);
    }

    return [...coverage].sort();
  }

  async listActive() {
    return this.prisma.regulatoryEquivalency.findMany({
      where: { active: true },
      orderBy: [{ fromJurisdiction: 'asc' }, { toJurisdiction: 'asc' }],
    });
  }
}
