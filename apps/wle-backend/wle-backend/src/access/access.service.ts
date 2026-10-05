import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VerificationService } from '../verification/verification.service';

@Injectable()
export class AccessService {
  constructor(
    private prisma: PrismaService,
    private verification: VerificationService,
  ) {}

  async check(workerId: number, siteId: number) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      include: { company: true },
    });

    if (!worker) throw new NotFoundException('Worker not found');

    const site = await this.prisma.site.findUnique({
      where: { id: siteId },
    });

    if (!site) throw new NotFoundException('Site not found');

    const compliance = await this.verification.evaluateWorkerCompliance(
      workerId,
    );

    const blocking = compliance.issues.filter(
      (i) =>
        i.type === 'MISSING' ||
        i.type === 'EXPIRED' ||
        i.type === 'NO_DOCUMENT',
    );

    return {
      worker: {
        displayName: `${worker.firstName} ${worker.lastName}`,
        companyName: worker.company?.name ?? null,
      },
      site: { name: site.name },
      allowed: blocking.length === 0,
      issueCount: blocking.length,
    };
  }
}
