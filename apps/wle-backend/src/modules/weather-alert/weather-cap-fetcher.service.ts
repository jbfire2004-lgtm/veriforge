import { Injectable, Logger } from '@nestjs/common';

const GEOMET_ALERTS_URL =
  process.env.WEATHER_GEOMET_ALERTS_URL ??
  'https://api.weather.gc.ca/collections/agg-captivate-alerts/items?lang=en-CA&limit=500&f=json';

const EC_WARNINGS_INDEX =
  process.env.WEATHER_EC_INDEX_URL ??
  'https://weather.gc.ca/warnings/index_e.html';

@Injectable()
export class WeatherCapFetcherService {
  private readonly logger = new Logger(WeatherCapFetcherService.name);

  async fetchGeometAlerts(): Promise<unknown | null> {
    try {
      const res = await fetch(GEOMET_ALERTS_URL, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) {
        this.logger.warn(`GeoMet alerts HTTP ${res.status}`);
        return null;
      }
      return res.json();
    } catch (e) {
      this.logger.warn(`GeoMet fetch failed: ${e}`);
      return null;
    }
  }

  async fetchWarningsIndexHtml(): Promise<string | null> {
    try {
      const res = await fetch(EC_WARNINGS_INDEX, {
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) return null;
      return res.text();
    } catch (e) {
      this.logger.warn(`EC index fetch failed: ${e}`);
      return null;
    }
  }

  async fetchCapXml(url: string): Promise<string | null> {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
      if (!res.ok) return null;
      return res.text();
    } catch (e) {
      this.logger.warn(`CAP XML fetch failed for ${url}: ${e}`);
      return null;
    }
  }
}
