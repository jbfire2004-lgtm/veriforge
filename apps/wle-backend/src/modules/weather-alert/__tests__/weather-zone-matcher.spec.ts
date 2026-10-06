import { WeatherZoneMatcherService } from '../weather-zone-matcher.service';

describe('WeatherZoneMatcherService', () => {
  const matcher = new WeatherZoneMatcherService();

  const box = {
    type: 'Polygon' as const,
    coordinates: [
      [
        [-115, 50],
        [-110, 50],
        [-110, 55],
        [-115, 55],
        [-115, 50],
      ],
    ],
  };

  it('returns true for point inside polygon', () => {
    expect(matcher.isPointInZone(52.5, -112.5, box)).toBe(true);
  });

  it('returns false for point outside polygon', () => {
    expect(matcher.isPointInZone(40, -100, box)).toBe(false);
  });
});
