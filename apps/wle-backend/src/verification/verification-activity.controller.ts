import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';

function resultFromChecklist(checklist: unknown): 'SAFE' | 'UNSAFE' {
  if (checklist == null || typeof checklist !== 'object') return 'UNSAFE';
  const values = Object.values(checklist as Record<string, unknown>);
  if (values.length === 0) return 'UNSAFE';
  return values.every((v) => v === true) ? 'SAFE' : 'UNSAFE';
}

/**
 * Legacy paths used by the supervisor UI (`/verification/logs/...`).
 * Data is sourced from {@link DigitalSignoff} rows, not a separate audit table.
 */
@Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
@Controller('verification')
export class VerificationActivityController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('logs/recent')
  async recentLogs() {
    const rows = await this.prisma.digitalSignoff.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        worker: true,
        equipment: true,
      },
    });
    return rows.map((r) => ({
      id: r.id,
      result: resultFromChecklist(r.checklist),
      worker: r.worker,
      equipment: r.equipment,
      createdAt: r.createdAt,
    }));
  }

  @Get('logs/worker/:workerId')
  async logsForWorker(@Param('workerId', ParseIntPipe) workerId: number) {
    const rows = await this.prisma.digitalSignoff.findMany({
      where: { workerId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        worker: true,
        equipment: true,
      },
    });
    return rows.map((r) => ({
      id: r.id,
      result: resultFromChecklist(r.checklist),
      worker: r.worker,
      equipment: r.equipment,
      createdAt: r.createdAt,
    }));
  }

  @Get('logs/equipment/:equipmentId')
  async logsForEquipment(
    @Param('equipmentId', ParseIntPipe) equipmentId: number,
  ) {
    const rows = await this.prisma.digitalSignoff.findMany({
      where: { equipmentId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        worker: true,
        equipment: true,
      },
    });
    return rows.map((r) => ({
      id: r.id,
      result: resultFromChecklist(r.checklist),
      worker: r.worker,
      equipment: r.equipment,
      createdAt: r.createdAt,
    }));
  }
}
