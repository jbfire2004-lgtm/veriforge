import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SafetyStationService {
  constructor(private prisma: PrismaService) {}

  // REGISTER / CREATE STATION
  async create(data: { name: string; code: string; siteId?: number }) {
    return this.prisma.safetyStation.create({
      data: {
        name: data.name,
        code: data.code,
        siteId: data.siteId ?? null,
      },
    });
  }

  // LIST ALL STATIONS
  async findAll() {
    return this.prisma.safetyStation.findMany({
      orderBy: { name: 'asc' },
      include: { site: true },
    });
  }

  // GET BY ID
  async findOne(id: number) {
    const station = await this.prisma.safetyStation.findUnique({
      where: { id },
      include: { site: true },
    });

    if (!station) throw new NotFoundException('Safety station not found');
    return station;
  }

  // GET BY CODE (FOR DEVICE BOOTSTRAP)
  async findByCode(code: string) {
    const station = await this.prisma.safetyStation.findUnique({
      where: { code },
      include: { site: true },
    });

    if (!station) throw new NotFoundException('Safety station not found');
    return station;
  }

  // HEARTBEAT / PING
  async ping(code: string) {
    const station = await this.prisma.safetyStation.findUnique({
      where: { code },
    });

    if (!station) throw new NotFoundException('Safety station not found');

    return this.prisma.safetyStation.update({
      where: { code },
      data: { lastPing: new Date(), active: true },
    });
  }

  // UPDATE STATION
  async update(
    id: number,
    data: Partial<{ name: string; siteId: number | null; active: boolean }>,
  ) {
    const existing = await this.prisma.safetyStation.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Safety station not found');

    return this.prisma.safetyStation.update({
      where: { id },
      data: {
        name: data.name ?? existing.name,
        siteId: data.siteId !== undefined ? data.siteId : existing.siteId,
        active: data.active !== undefined ? data.active : existing.active,
      },
    });
  }

  // STATIONS FOR SITE
  async forSite(siteId: number) {
    return this.prisma.safetyStation.findMany({
      where: { siteId },
      orderBy: { name: 'asc' },
    });
  }
}
