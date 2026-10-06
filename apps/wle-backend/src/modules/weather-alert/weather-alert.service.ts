import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { NOTIFICATION_TYPES } from '../../notifications/notification-types';
import type { WalletWeatherAlertView } from './entities/weather-alert.entity';
import type { GeoPolygon } from './entities/weather-zone-map.entity';
import { UserLocationResolverService } from './user-location-resolver.service';
import { WeatherAlertMapper } from './weather-alert.mapper';
import { WeatherAlertRepository } from './weather-alert.repository';
import { WeatherCapFetcherService } from './weather-cap-fetcher.service';
import { WeatherCapParserService } from './weather-cap-parser.service';
import { WeatherZoneMatcherService } from './weather-zone-matcher.service';

@Injectable()
export class WeatherAlertService {
  private readonly logger = new Logger(WeatherAlertService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: WeatherAlertRepository,
    private readonly fetcher: WeatherCapFetcherService,
    private readonly parser: WeatherCapParserService,
    private readonly locationResolver: UserLocationResolverService,
    private readonly zoneMatcher: WeatherZoneMatcherService,
    private readonly notifications: NotificationsService,
  ) {}

  async pollAndProcess() {
    await this.repository.ensureDefaultZones();
    const ingested = await this.ingestFeeds();
    await this.repository.markExpiredAlerts();
    const notified = await this.matchAndNotify();
    this.logger.log(`Weather poll: ingested=${ingested}, notified=${notified}`);
    return { ingested, notified };
  }

  async ingestFeeds(): Promise<number> {
    let count = 0;
    const geomet = await this.fetcher.fetchGeometAlerts();
    if (geomet) {
      const normalized = this.parser.parseGeometCollection(geomet);
      count += await this.persistNormalized(normalized);
    }

    const indexHtml = await this.fetcher.fetchWarningsIndexHtml();
    if (indexHtml) {
      const links = this.parser
        .extractCapLinksFromIndexHtml(indexHtml)
        .slice(0, 15);
      for (const url of links) {
        const xml = await this.fetcher.fetchCapXml(url);
        if (!xml) continue;
        const parsed = this.parser.parseCapXml(xml);
        count += await this.persistNormalized(parsed, xml);
      }
    }
    return count;
  }

  private async persistNormalized(
    alerts: ReturnType<WeatherCapParserService['parseGeometCollection']>,
    rawCapXml?: string,
  ) {
    let count = 0;
    for (const n of alerts) {
      if (n.polygon) {
        const province = WeatherAlertMapper.regionFromZone(n.zoneId);
        await this.repository.upsertZone(n.zoneId, province, n.polygon);
      }
      const mapped = WeatherAlertMapper.fromCap(n, rawCapXml);
      await this.repository.upsertAlert(mapped);
      count++;
    }
    return count;
  }

  async matchAndNotify(): Promise<number> {
    const now = new Date();
    const alerts = await this.repository.listActiveAlerts(now);
    const userIds = await this.repository.listUserIdsWithNotificationsEnabled();
    let totalNotified = 0;

    for (const alert of alerts) {
      const polygon = await this.resolveAlertPolygon(alert.zoneId);
      if (!polygon) continue;

      const affected: number[] = [];
      for (const userId of userIds) {
        const loc = await this.locationResolver.getUserActiveLocation(userId);
        if (!loc) continue;
        if (this.zoneMatcher.isPointInZone(loc.lat, loc.lng, polygon)) {
          affected.push(userId);
        }
      }

      const pending = await this.repository.findUsersNotYetNotified(
        alert.id,
        affected,
      );
      if (!pending.length) continue;

      await this.notifications.notifyUsers({
        userIds: pending,
        type: NOTIFICATION_TYPES.WEATHER_ALERT,
        title: alert.headline,
        body: alert.description,
        payload: {
          type: 'weather_alert',
          title: alert.headline,
          message: alert.description,
          severity: alert.severity,
          zone: alert.zoneId,
          expires_at: alert.expiresAt?.toISOString() ?? null,
          alert_id: alert.alertId,
        },
        dedupeKey: `weather:${alert.alertId}:${alert.zoneId}`,
      });

      await this.repository.recordDeliveries(alert.id, pending);
      totalNotified += pending.length;
    }
    return totalNotified;
  }

  async getActiveForUser(userId: number) {
    const loc = await this.locationResolver.getUserActiveLocation(userId);
    const alerts = await this.repository.listActiveAlerts();
    if (!loc) {
      const prefs = await this.prisma.userHomepagePreferences.findUnique({
        where: { userId },
      });
      const region = prefs?.region ?? 'CA';
      const byZone = alerts.filter((a) =>
        a.zoneId.toUpperCase().includes(region.toUpperCase()),
      );
      return byZone.map((a) => this.toPublicAlert(a));
    }

    const matched = [];
    for (const alert of alerts) {
      const polygon = await this.resolveAlertPolygon(alert.zoneId);
      if (
        polygon &&
        this.zoneMatcher.isPointInZone(loc.lat, loc.lng, polygon)
      ) {
        matched.push(this.toPublicAlert(alert));
      }
    }
    return matched;
  }

  async getActiveByZone(zoneId: string) {
    const rows = await this.repository.listActiveByZone(zoneId);
    return rows.map((a) => this.toPublicAlert(a));
  }

  async getWalletAlertsForWorker(
    workerId: number,
  ): Promise<WalletWeatherAlertView[]> {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      select: { userId: true },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    if (worker.userId) {
      const prefs = await this.prisma.userHomepagePreferences.findUnique({
        where: { userId: worker.userId },
      });
      if (prefs?.weatherWalletDisplayEnabled === false) return [];
    }

    const userId = worker.userId;
    if (!userId) {
      const fallback = await this.getActiveByZone('CA-ON');
      return fallback.map((a) => this.walletShape(a));
    }

    const active = await this.getActiveForUser(userId);
    return active.map((a) => this.walletShape(a));
  }

  async getSettings(userId: number) {
    return this.prisma.userHomepagePreferences.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  async updateSettings(
    userId: number,
    data: {
      weatherNotificationsEnabled?: boolean;
      weatherWalletDisplayEnabled?: boolean;
      showWeatherAlerts?: boolean;
    },
  ) {
    return this.prisma.userHomepagePreferences.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  private async resolveAlertPolygon(
    zoneId: string,
  ): Promise<GeoPolygon | undefined> {
    const exact = await this.repository.getZonePolygon(zoneId);
    if (exact) return exact;

    const prefix = zoneId.split('-').slice(0, 2).join('-');
    if (prefix !== zoneId) {
      return this.repository.getZonePolygon(prefix);
    }
    return undefined;
  }

  private toPublicAlert(alert: {
    id: string;
    alertId: string;
    zoneId: string;
    alertType: string;
    severity: string;
    headline: string;
    description: string;
    effectiveAt: Date;
    expiresAt: Date | null;
  }) {
    return {
      id: alert.id,
      alert_id: alert.alertId,
      zone_id: alert.zoneId,
      alert_type: alert.alertType,
      severity: alert.severity,
      headline: alert.headline,
      description: alert.description,
      effective_at: alert.effectiveAt.toISOString(),
      expires_at: alert.expiresAt?.toISOString() ?? null,
    };
  }

  private walletShape(alert: {
    alert_type: string;
    severity: string;
    headline: string;
    description: string;
    expires_at: string | null;
  }): WalletWeatherAlertView {
    return {
      alert_type: alert.alert_type,
      severity: alert.severity,
      headline: alert.headline,
      description: alert.description,
      expires_at: alert.expires_at,
    };
  }
}
