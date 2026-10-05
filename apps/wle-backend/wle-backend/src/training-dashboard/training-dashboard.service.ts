import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VerificationService } from '../verification/verification.service';

@Injectable()
export class TrainingDashboardService {
  constructor(
    private prisma: PrismaService,
    private verification: VerificationService,
  ) {}

  async getCompanyDashboard(companyId: number) {
    const workers = await this.prisma.worker.findMany({
      where: { companyId },
      orderBy: { lastName: 'asc' },
    });

    const results = [];

    for (const worker of workers) {
      const compliance = await this.verification.evaluateWorkerCompliance(
        worker.id,
      );

      results.push({
        worker,
        compliance,
      });
    }

    const nonCompliant = results.filter((r) => !r.compliance.isCompliant);
    const compliant = results.filter((r) => r.compliance.isCompliant);

    const expiringSoon = results.filter((r) =>
      r.compliance.issues.some((i) => i.type === 'EXPIRING'),
    );

    return {
      summary: {
        totalWorkers: workers.length,
        compliant: compliant.length,
        nonCompliant: nonCompliant.length,
        expiringSoon: expiringSoon.length,
      },
      compliant,
      nonCompliant,
      expiringSoon,
      all: results,
    };
  }
}
