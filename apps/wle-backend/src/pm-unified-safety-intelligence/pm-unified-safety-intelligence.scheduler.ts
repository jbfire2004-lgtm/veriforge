import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { PmUnifiedSafetyIntelligenceService } from './pm-unified-safety-intelligence.service';

@Injectable()
export class PmUnifiedSafetyIntelligenceScheduler {
  private readonly logger = new Logger(
    PmUnifiedSafetyIntelligenceScheduler.name,
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly intel: PmUnifiedSafetyIntelligenceService,
  ) {}

  /** Nightly batch inference for active projects */
  @Cron('0 2 * * *')
  async nightlyBatch() {
    const projects = await this.prisma.project.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, companyId: true },
      take: 50,
    });
    for (const p of projects) {
      try {
        await this.intel.runBatchInference(p.companyId, p.id);
      } catch (e) {
        this.logger.warn(
          `Batch inference failed project ${p.id}: ${(e as Error).message}`,
        );
      }
    }
  }
}
