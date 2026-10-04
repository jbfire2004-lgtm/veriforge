export type GeoPolygon = {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[][][] | number[][][][];
};

export type WeatherZoneRecord = {
  id: string;
  zoneId: string;
  province: string;
  polygon: GeoPolygon;
};
