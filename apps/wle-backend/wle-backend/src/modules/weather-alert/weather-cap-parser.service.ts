import { Injectable, Logger } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';
import type { GeoPolygon } from './entities/weather-zone-map.entity';

export type NormalizedCapAlert = {
  alertId: string;
  zoneId: string;
  alertType: string;
  severity: string;
  headline: string;
  description: string;
  effectiveAt: Date;
  expiresAt: Date | null;
  polygon?: GeoPolygon;
};

type GeometFeature = {
  id?: string;
  geometry?: GeoPolygon | null;
  properties?: Record<string, unknown>;
};

@Injectable()
export class WeatherCapParserService {
  private readonly logger = new Logger(WeatherCapParserService.name);
  private readonly xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });

  parseGeometCollection(body: unknown): NormalizedCapAlert[] {
    const features = this.extractFeatures(body);
    const out: NormalizedCapAlert[] = [];
    for (const f of features) {
      const parsed = this.fromGeometFeature(f);
      if (parsed) out.push(parsed);
    }
    return out;
  }

  parseCapXml(xml: string): NormalizedCapAlert[] {
    try {
      const doc = this.xmlParser.parse(xml) as Record<string, unknown>;
      const alertNode = this.findAlertNode(doc);
      if (!alertNode) return [];
      const alerts = Array.isArray(alertNode) ? alertNode : [alertNode];
      return alerts
        .map((a) => this.fromCapNode(a as Record<string, unknown>))
        .filter((a): a is NormalizedCapAlert => a !== null);
    } catch (e) {
      this.logger.warn(`CAP XML parse failed: ${e}`);
      return [];
    }
  }

  extractCapLinksFromIndexHtml(html: string): string[] {
    const links = new Set<string>();
    const re = /href="([^"]+\.xml[^"]*)"/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      const href = m[1];
      if (/cap|alert|warning/i.test(href)) {
        links.add(
          href.startsWith('http')
            ? href
            : `https://weather.gc.ca${href.startsWith('/') ? '' : '/'}${href}`,
        );
      }
    }
    return [...links].slice(0, 50);
  }

  private extractFeatures(body: unknown): GeometFeature[] {
    if (!body || typeof body !== 'object') return [];
    const root = body as Record<string, unknown>;
    const features =
      (root.features as GeometFeature[] | undefined) ??
      ((root as { type?: string }).type === 'FeatureCollection'
        ? (root.features as GeometFeature[])
        : undefined);
    return Array.isArray(features) ? features : [];
  }

  private fromGeometFeature(f: GeometFeature): NormalizedCapAlert | null {
    const p = f.properties ?? {};
    const alertId = String(p.identifier ?? f.id ?? '').trim();
    if (!alertId) return null;

    const zoneId = this.zoneFromProperties(p) ?? alertId;
    const effectiveAt = this.parseDate(p.effective) ?? new Date();
    const expiresAt = this.parseDate(p.expires);

    return {
      alertId,
      zoneId,
      alertType: String(p.event ?? p.alertType ?? 'weather'),
      severity: String(p.severity ?? p.urgency ?? 'unknown'),
      headline: String(p.headline ?? p.event ?? 'Weather alert'),
      description: String(p.description ?? p.headline ?? ''),
      effectiveAt,
      expiresAt,
      polygon: f.geometry ?? undefined,
    };
  }

  private fromCapNode(
    node: Record<string, unknown>,
  ): NormalizedCapAlert | null {
    const info = this.first(node.info);
    if (!info || typeof info !== 'object') return null;
    const i = info as Record<string, unknown>;
    const alertId = String(i.identifier ?? node['@_identifier'] ?? '').trim();
    if (!alertId) return null;

    const area = this.first(i.area) as Record<string, unknown> | undefined;
    const geocode = area?.geocode as Record<string, unknown> | undefined;
    const zoneId =
      String(
        this.firstValue(geocode, 'value') ?? area?.areaDesc ?? alertId,
      ).trim() || alertId;

    return {
      alertId,
      zoneId,
      alertType: String(i.event ?? 'weather'),
      severity: String(i.severity ?? 'unknown'),
      headline: String(i.headline ?? i.event ?? 'Weather alert'),
      description: String(i.description ?? i.headline ?? ''),
      effectiveAt: this.parseDate(i.effective) ?? new Date(),
      expiresAt: this.parseDate(i.expires),
    };
  }

  private zoneFromProperties(p: Record<string, unknown>): string | null {
    const codes = p.geocode ?? p['geocode'];
    if (Array.isArray(codes)) {
      for (const c of codes) {
        const v = (c as { value?: string })?.value;
        if (v) return v;
      }
    }
    if (typeof codes === 'object' && codes) {
      const v = (codes as { value?: string }).value;
      if (v) return v;
    }
    const area = String(p.areaDesc ?? '').trim();
    return area || null;
  }

  private findAlertNode(doc: Record<string, unknown>): unknown {
    if (doc.alert) return doc.alert;
    const cap = doc.Cap as Record<string, unknown> | undefined;
    if (cap?.alert) return cap.alert;
    return null;
  }

  private first<T>(v: T | T[] | undefined): T | undefined {
    if (v === undefined) return undefined;
    return Array.isArray(v) ? v[0] : v;
  }

  private firstValue(obj: unknown, key: string): string | undefined {
    if (!obj || typeof obj !== 'object') return undefined;
    const o = obj as Record<string, unknown>;
    const entries = Array.isArray(o) ? o : [o];
    for (const e of entries) {
      if (
        (e as Record<string, unknown>)['@_valueName'] === key ||
        key in (e as object)
      ) {
        return String(
          (e as Record<string, unknown>).value ??
            (e as Record<string, unknown>)[key] ??
            '',
        );
      }
      if ((e as Record<string, unknown>).value) {
        return String((e as Record<string, unknown>).value);
      }
    }
    return undefined;
  }

  private parseDate(v: unknown): Date | null {
    if (!v) return null;
    const d = new Date(String(v));
    return Number.isNaN(d.getTime()) ? null : d;
  }
}
