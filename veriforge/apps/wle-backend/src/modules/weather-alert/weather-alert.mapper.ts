import type { WeatherAlertSeverity } from '@prisma/client';
import type { WeatherAlertRecord } from './entities/weather-alert.entity';
import type { NormalizedCapAlert } from './weather-cap-parser.service';

export class WeatherAlertMapper {
  static fromCap(
    normalized: NormalizedCapAlert,
    rawCapXml?: string,
  ): Omit<WeatherAlertRecord, 'id' | 'createdAt' | 'updatedAt' | 'lastSentAt'> {
    return {
      alertId: normalized.alertId,
      zoneId: normalized.zoneId,
      alertType: normalized.alertType,
      severity: normalized.severity,
      headline: normalized.headline,
      description: normalized.description,
      effectiveAt: normalized.effectiveAt,
      expiresAt: normalized.expiresAt,
      rawCapXml: rawCapXml ?? null,
    };
  }

  static toHubSeverity(severity: string): WeatherAlertSeverity {
    const s = severity.toLowerCase();
    if (s.includes('extreme') || s.includes('emergency')) return 'EMERGENCY';
    if (s.includes('severe') || s.includes('warning')) return 'WARNING';
    if (s.includes('watch') || s.includes('moderate')) return 'WATCH';
    return 'INFO';
  }

  static regionFromZone(zoneId: string): string {
    const parts = zoneId.split('-');
    if (parts.length >= 2) return parts[1] ?? zoneId;
    return zoneId;
  }
}
