import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatrixService {
  constructor(private prisma: PrismaService) {}

  async matrix(companyId: number) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) throw new NotFoundException('Company not found');

    // Fetch workers by companyId (safe for all schemas)
    const workers = await this.prisma.worker.findMany({
      where: { companyId },
      include: {
        trainingRecords: {
          include: {
            certification: true,
          },
        },
      },
    });

    const matrix = workers.map((worker) => ({
      workerId: worker.id,
      workerLabel: `Worker #${worker.id}`, // no name field required
      certifications: worker.trainingRecords.map((rec) => ({
        certificationId: rec.certificationId,
        certificationName: rec.certification.name,
        expiresAt: rec.expiresAt,
      })),
    }));

    return {
      companyId: company.id,
      companyName: company.name,
      matrix,
    };
  }
}
