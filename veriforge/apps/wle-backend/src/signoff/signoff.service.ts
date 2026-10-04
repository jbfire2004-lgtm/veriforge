import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePreUseSignoffDto } from './dto/create-preuse-signoff.dto';
import { SignoffAnalyticsDto } from './dto/signoff-analytics.dto';

@Injectable()
export class SignoffService {
  constructor(private prisma: PrismaService) {}

  // CREATE SIGNOFF
  create(data: CreatePreUseSignoffDto) {
    const hasWorker =
      data.workerId !== null &&
      data.workerId !== undefined &&
      Number.isFinite(data.workerId);
    const hasEquip =
      data.equipmentId !== null &&
      data.equipmentId !== undefined &&
      Number.isFinite(data.equipmentId);

    if (!hasWorker && !hasEquip) {
      throw new BadRequestException(
        'Pre-use signoff requires workerId and/or equipmentId',
      );
    }

    if (
      typeof data.checklist !== 'object' ||
      data.checklist === null ||
      Array.isArray(data.checklist)
    ) {
      throw new BadRequestException('checklist must be a key/value object');
    }

    return this.prisma.digitalSignoff.create({
      data: {
        workerId: data.workerId ?? null,
        equipmentId: data.equipmentId ?? null,
        supervisorId: data.supervisorId ?? null,
        siteId: data.siteId ?? null,
        checklist: data.checklist,
        workerSignature: data.workerSignature ?? null,
        supervisorSignature: data.supervisorSignature,
        notes: data.notes ?? null,
      },
    });
  }

  // GET ONE
  findOne(id: number) {
    return this.prisma.digitalSignoff.findUnique({
      where: { id },
      include: {
        worker: { include: { company: true } },
        equipment: true,
        supervisor: true,
        site: true,
      },
    });
  }

  // FULL HISTORY
  history() {
    return this.prisma.digitalSignoff.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        worker: true,
        equipment: true,
        supervisor: true,
        site: true,
      },
    });
  }

  // RECENT 10
  recent() {
    return this.prisma.digitalSignoff.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        worker: true,
        equipment: true,
        supervisor: true,
        site: true,
      },
    });
  }

  // BASIC STATS
  async stats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [todayCount, weekCount, pending] = await Promise.all([
      this.prisma.digitalSignoff.count({
        where: { createdAt: { gte: today } },
      }),
      this.prisma.digitalSignoff.count({
        where: { createdAt: { gte: weekAgo } },
      }),
      this.prisma.digitalSignoff.count({
        where: { supervisorSignature: null },
      }),
    ]);

    return { today: todayCount, week: weekCount, pending };
  }

  // ANALYTICS
  async analytics(): Promise<SignoffAnalyticsDto> {
    const total = await this.prisma.digitalSignoff.count();

    const all = await this.prisma.digitalSignoff.findMany();
    let safeCount = 0;
    const checklistFailures: Record<string, number> = {};

    all.forEach((r) => {
      const c = r.checklist as any;
      const values = Object.values(c) as boolean[];
      const isSafe = values.every((v) => v === true);
      if (isSafe) safeCount++;

      Object.entries(c).forEach(([key, value]) => {
        if (!value) {
          checklistFailures[key] = (checklistFailures[key] || 0) + 1;
        }
      });
    });

    const unsafeCount = total - safeCount;

    const workerCount = await this.prisma.digitalSignoff.count({
      where: { workerId: { not: null } },
    });

    const equipmentCount = await this.prisma.digitalSignoff.count({
      where: { equipmentId: { not: null } },
    });

    const weeklyTrend = (
      await this.prisma.$queryRawUnsafe<any[]>(`
        SELECT
          to_char("createdAt", 'Dy') AS label,
          count(*)::int AS count
        FROM "DigitalSignoff"
        WHERE "createdAt" > now() - interval '7 days'
        GROUP BY label
        ORDER BY min("createdAt")
      `)
    ).map((r) => ({
      label: r.label as string,
      count: Number(r.count),
    }));

    return {
      total,
      safeCount,
      unsafeCount,
      workerCount,
      equipmentCount,
      checklistFailures,
      weeklyTrend,
    };
  }
}
