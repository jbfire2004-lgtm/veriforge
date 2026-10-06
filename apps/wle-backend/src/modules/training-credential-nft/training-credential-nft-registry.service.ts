import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TrainingCredentialNftRegistryService {
  constructor(private readonly prisma: PrismaService) {}

  findByTrainingRecordId(trainingRecordId: number) {
    return this.prisma.trainingCredentialNft.findUnique({
      where: { trainingRecordId },
    });
  }

  findByWorkerId(workerId: number) {
    return this.prisma.trainingCredentialNft.findMany({
      where: { workerId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
