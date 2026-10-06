import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { GeoPolygon } from './entities/weather-zone-map.entity';
import { DEFAULT_WEATHER_ZONES } from './weather-zone-seed';

@Injectable()
export class WeatherAlertRepository {
  constructor(private readonly prisma: PrismaService) {}

  async ensureDefaultZones() {
    for (const z of DEFAULT_WEATHER_ZONES) {
      await this.prisma.weatherZoneMap.upsert({
        where: { zoneId: z.zoneId },
        create: {
          zoneId: z.zoneId,
          province: z.province,
          polygon: z.polygon as Prisma.InputJsonValue,
        },
        update: {},
      });
    }
  }

  async upsertZone(zoneId: string, province: string, polygon: GeoPolygon) {
    return this.prisma.weatherZoneMap.upsert({
      where: { zoneId },
      create: {
        zoneId,
        province,
        polygon: polygon as Prisma.InputJsonValue,
      },
      update: { province, polygon: polygon as Prisma.InputJsonValue },
    });
  }

  async upsertAlert(data: {
    alertId: string;
    zoneId: string;
    alertType: string;
    severity: string;
    headline: string;
    description: string;
    effectiveAt: Date;
    expiresAt: Date | null;
    rawCapXml?: string | null;
  }) {
    return this.prisma.weatherCapAlert.upsert({
      where: { alertId_zoneId: { alertId: data.alertId, zoneId: data.zoneId } },
      create: data,
      update: {
        alertType: data.alertType,
        severity: data.severity,
        headline: data.headline,
        description: data.description,
        effectiveAt: data.effectiveAt,
        expiresAt: data.expiresAt,
        rawCapXml: data.rawCapXml,
        updatedAt: new Date(),
      },
    });
  }

  async markExpiredAlerts(now = new Date()) {
    return this.prisma.weatherCapAlert.updateMany({
      where: {
        expiresAt: { lt: now },
        OR: [{ expiresAt: { not: null } }],
      },
      data: { updatedAt: now },
    });
  }

  async listActiveAlerts(now = new Date()) {
    return this.prisma.weatherCapAlert.findMany({
      where: {
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: [{ severity: 'desc' }, { effectiveAt: 'desc' }],
    });
  }

  async listActiveByZone(zoneId: string, now = new Date()) {
    return this.prisma.weatherCapAlert.findMany({
      where: {
        zoneId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: { effectiveAt: 'desc' },
    });
  }

  async getZonePolygon(zoneId: string) {
    const row = await this.prisma.weatherZoneMap.findUnique({
      where: { zoneId },
    });
    return row?.polygon as GeoPolygon | undefined;
  }

  async findUsersNotYetNotified(alertDbId: string, userIds: number[]) {
    if (!userIds.length) return [];
    const delivered = await this.prisma.weatherAlertDelivery.findMany({
      where: { alertId: alertDbId, userId: { in: userIds } },
      select: { userId: true },
    });
    const sent = new Set(delivered.map((d) => d.userId));
    return userIds.filter((id) => !sent.has(id));
  }

  async recordDeliveries(alertDbId: string, userIds: number[]) {
    if (!userIds.length) return;
    await this.prisma.weatherAlertDelivery.createMany({
      data: userIds.map((userId) => ({ userId, alertId: alertDbId })),
      skipDuplicates: true,
    });
    await this.prisma.weatherCapAlert.update({
      where: { id: alertDbId },
      data: { lastSentAt: new Date() },
    });
  }

  async listUserIdsWithNotificationsEnabled() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        homepagePreferences: {
          select: {
            weatherNotificationsEnabled: true,
            showWeatherAlerts: true,
          },
        },
      },
    });
    return users
      .filter((u) => {
        const p = u.homepagePreferences;
        if (!p) return true;
        return (
          p.weatherNotificationsEnabled !== false &&
          p.showWeatherAlerts !== false
        );
      })
      .map((u) => u.id);
  }
}
