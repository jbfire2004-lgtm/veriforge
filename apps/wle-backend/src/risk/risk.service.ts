import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RiskService {
  constructor(private prisma: PrismaService) {}

  async workerRisk(workerId: number) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      include: {
        trainingRecords: true,
        credentials: true,
        incidents: true,
      },
    });

    const now = new Date();
    const next30 = new Date();
    next30.setDate(now.getDate() + 30);

    let score = 0;

    if (worker.trainingRecords.some((t) => t.expiresAt <= now)) score += 40;
    if (worker.credentials.some((c) => c.expiresAt <= now)) score += 30;

    score += worker.incidents.length * 10;

    if (
      worker.trainingRecords.some(
        (t) => t.expiresAt > now && t.expiresAt <= next30,
      )
    )
      score += 10;

    return { workerId, score };
  }

  async equipmentRisk(equipmentId: number) {
    const eq = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: { incidents: true },
    });

    let score = 0;

    if (eq.incidents.length > 0) score += 50;
    score += (eq.incidents.length - 1) * 10;

    return { equipmentId: eq.id, score };
  }
}
