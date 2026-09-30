import { Injectable } from '@nestjs/common';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';
import type { GeoPolygon } from './entities/weather-zone-map.entity';

@Injectable()
export class WeatherZoneMatcherService {
  isPointInZone(lat: number, lng: number, polygon: GeoPolygon): boolean {
    const pt = point([lng, lat]);
    try {
      if (polygon.type === 'Polygon') {
        return booleanPointInPolygon(pt, {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: polygon.coordinates as number[][][],
          },
        });
      }
      if (polygon.type === 'MultiPolygon') {
        return booleanPointInPolygon(pt, {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'MultiPolygon',
            coordinates: polygon.coordinates as number[][][][],
          },
        });
      }
    } catch {
      return false;
    }
    return false;
  }
}
