import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseRepository } from './base.repository';

@Injectable()
export class TrainingRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findById(id: number) {
    return this.prisma.trainingRecord.findUnique({
      where: { id },
      include: {
        worker: true,
        certification: true,
      },
    });
  }

  listByWorker(workerId: number) {
    return this.prisma.trainingRecord.findMany({
      where: { workerId },
      orderBy: { expiresAt: 'asc' },
      include: { certification: true },
    });
  }
}
