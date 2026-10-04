import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { WeatherAlertMapper } from '../weather-alert/weather-alert.mapper';

import type { WeatherSnapshotDto } from './hub-homepage.types';

@Injectable()
export class WeatherHazardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSnapshot(
    region: string,

    companyId?: number,

    userId?: number,
  ): Promise<WeatherSnapshotDto> {
    const now = new Date();

    const capAlerts = userId
      ? await this.capAlertsForUser(userId, now)
      : await this.prisma.weatherCapAlert.findMany({
          where: {
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],

            zoneId: { contains: region, mode: 'insensitive' },
          },

          orderBy: [{ severity: 'desc' }, { effectiveAt: 'desc' }],

          take: 8,
        });

    const legacyAlerts = await this.prisma.hubWeatherAlert.findMany({
      where: {
        region,

        OR: [{ endsAt: null }, { endsAt: { gt: now } }],

        ...(companyId ? { OR: [{ companyId }, { companyId: null }] } : {}),
      },

      orderBy: [{ severity: 'desc' }, { startsAt: 'desc' }],

      take: 8,
    });

    const alerts = [
      ...capAlerts.map((a) => ({
        id: a.id,

        region: WeatherAlertMapper.regionFromZone(a.zoneId),

        title: a.headline,

        description: a.description,

        severity: WeatherAlertMapper.toHubSeverity(a.severity),

        hazardType: a.alertType,

        startsAt: a.effectiveAt.toISOString(),

        endsAt: a.expiresAt?.toISOString() ?? null,
      })),

      ...legacyAlerts.map((a) => ({
        id: a.id,

        region: a.region,

        title: a.title,

        description: a.description,

        severity: a.severity,

        hazardType: a.hazardType,

        startsAt: a.startsAt.toISOString(),

        endsAt: a.endsAt?.toISOString() ?? null,
      })),
    ].slice(0, 8);

    const hasWarning = alerts.some(
      (a) => a.severity === 'WARNING' || a.severity === 'EMERGENCY',
    );

    return {
      region,

      summary: hasWarning
        ? 'Active weather or hazard alerts for your work area'
        : 'Conditions are stable — review site-specific hazards before work',

      temperatureC: null,

      conditions: hasWarning ? 'Alert' : 'Clear',

      alerts,
    };
  }

  private async capAlertsForUser(userId: number, now: Date) {
    const prefs = await this.prisma.userHomepagePreferences.findUnique({
      where: { userId },
    });

    if (prefs?.showWeatherAlerts === false) return [];

    const region = prefs?.region ?? 'CA';

    return this.prisma.weatherCapAlert.findMany({
      where: {
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],

        zoneId: { contains: region, mode: 'insensitive' },
      },

      orderBy: [{ severity: 'desc' }, { effectiveAt: 'desc' }],

      take: 8,
    });
  }
}
