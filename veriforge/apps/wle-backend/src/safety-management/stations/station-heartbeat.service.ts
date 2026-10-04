import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PmSafetyStationsService } from '../../pm-safety-stations/pm-safety-stations.service';

@Injectable()
export class StationHeartbeatService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly pmStations?: PmSafetyStationsService,
  ) {}

  async recordHeartbeat(
    stationCode: string,
    payload?: Record<string, unknown>,
  ) {
    if (this.pmStations) {
      return this.pmStations.recordHeartbeat(stationCode, {
        payload,
        batteryLevel: payload?.batteryLevel as number | undefined,
        storageFreeMb: payload?.storageFreeMb as number | undefined,
        sensorHealth: payload?.sensorHealth as
          | Record<string, boolean>
          | undefined,
        firmwareVersion: payload?.firmwareVersion as string | undefined,
        online: payload?.online as boolean | undefined,
      });
    }

    const station = await this.prisma.safetyStation.findUnique({
      where: { code: stationCode },
    });
    if (!station) throw new NotFoundException('Safety station not found');

    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.safetyStation.update({
        where: { id: station.id },
        data: { lastPing: now },
      }),
      this.prisma.safetyStationHeartbeat.create({
        data: {
          stationId: station.id,
          payload: (payload ?? {}) as Prisma.InputJsonValue,
        },
      }),
    ]);

    return { stationId: station.id, lastPing: now.toISOString(), ok: true };
  }

  async listHeartbeats(stationId: number, limit = 50) {
    if (this.pmStations) {
      return this.pmStations.listHeartbeats(stationId, limit);
    }
    return this.prisma.safetyStationHeartbeat.findMany({
      where: { stationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async stationHealth(siteId?: number) {
    if (this.pmStations) {
      return this.pmStations.stationHealth(undefined, siteId);
    }

    const stations = await this.prisma.safetyStation.findMany({
      where: { siteId, active: true },
      select: {
        id: true,
        code: true,
        name: true,
        lastPing: true,
        siteId: true,
      },
    });

    const staleMs = 5 * 60 * 1000;
    const now = Date.now();

    return stations.map((s) => ({
      ...s,
      healthy: s.lastPing ? now - s.lastPing.getTime() < staleMs : false,
      minutesSincePing: s.lastPing
        ? Math.round((now - s.lastPing.getTime()) / 60000)
        : null,
    }));
  }
}
