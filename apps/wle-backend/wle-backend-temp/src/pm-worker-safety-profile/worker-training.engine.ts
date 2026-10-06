import { PrismaService } from '../prisma/prisma.service';

export type TrainingGap = {
  trainingCode: string;
  courseName: string;
  reason: string;
  status: 'missing' | 'expired';
};

export class WorkerTrainingEngine {
  constructor(private readonly prisma: PrismaService) {}

  async syncFromRecords(workerId: number, profileId?: string) {
    const records = await this.prisma.trainingRecord.findMany({
      where: { workerId },
      include: { certification: true },
      orderBy: { issuedAt: 'desc' },
    });

    const now = new Date();
    for (const r of records) {
      const code = r.certification.code ?? r.certification.name;
      const expiresAt =
        r.expiresAt ?? new Date(r.issuedAt.getTime() + 365 * 86400000);
      const status = expiresAt > now ? 'valid' : 'expired';

      const existing = await this.prisma.pmWorkerSafetyTraining.findFirst({
        where: { workerId, trainingCode: code },
      });

      if (existing) {
        await this.prisma.pmWorkerSafetyTraining.update({
          where: { id: existing.id },
          data: {
            courseName: r.certification.name,
            completedAt: r.completedAt ?? r.issuedAt,
            expiresAt,
            status,
            legacyRecordId: r.id,
          },
        });
      } else {
        await this.prisma.pmWorkerSafetyTraining.create({
          data: {
            workerId,
            profileId,
            trainingCode: code,
            courseName: r.certification.name,
            completedAt: r.completedAt ?? r.issuedAt,
            expiresAt,
            status,
            legacyRecordId: r.id,
            sourceType: 'training_record',
          },
        });
      }
    }
  }

  gapsFromMatrix(
    required: Array<{ trainingCode: string; trainingName: string }>,
    held: Array<{ trainingCode: string; status: string }>,
  ): TrainingGap[] {
    const gaps: TrainingGap[] = [];
    for (const req of required) {
      const match = held.find((h) => h.trainingCode === req.trainingCode);
      if (!match) {
        gaps.push({
          trainingCode: req.trainingCode,
          courseName: req.trainingName,
          reason: 'Not completed',
          status: 'missing',
        });
      } else if (match.status === 'expired') {
        gaps.push({
          trainingCode: req.trainingCode,
          courseName: req.trainingName,
          reason: 'Expired',
          status: 'expired',
        });
      }
    }
    return gaps;
  }
}
