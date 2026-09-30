import type { GeoPolygon } from './entities/weather-zone-map.entity';

/** Provincial bounding boxes (approx.) for primary-location fallback. */
export const DEFAULT_WEATHER_ZONES: Array<{
  zoneId: string;
  province: string;
  polygon: GeoPolygon;
}> = [
  boxZone('CA-AB', 'AB', -120, 49, -110, 60),
  boxZone('CA-BC', 'BC', -139, 48, -114, 60),
  boxZone('CA-MB', 'MB', -102, 49, -89, 60),
  boxZone('CA-NB', 'NB', -69, 44, -64, 48),
  boxZone('CA-NL', 'NL', -67, 46, -52, 60),
  boxZone('CA-NS', 'NS', -66, 43, -59, 47),
  boxZone('CA-NT', 'NT', -136, 60, -102, 78),
  boxZone('CA-NU', 'NU', -120, 60, -61, 83),
  boxZone('CA-ON', 'ON', -95, 42, -74, 57),
  boxZone('CA-PE', 'PE', -64.5, 45.9, -61.9, 47.1),
  boxZone('CA-QC', 'QC', -79, 45, -57, 63),
  boxZone('CA-SK', 'SK', -110, 49, -101, 60),
  boxZone('CA-YT', 'YT', -141, 60, -123, 70),
];

function boxZone(
  zoneId: string,
  province: string,
  west: number,
  south: number,
  east: number,
  north: number,
): { zoneId: string; province: string; polygon: GeoPolygon } {
  return {
    zoneId,
    province,
    polygon: {
      type: 'Polygon',
      coordinates: [
        [
          [west, south],
          [east, south],
          [east, north],
          [west, north],
          [west, south],
        ],
      ],
    },
  };
}
