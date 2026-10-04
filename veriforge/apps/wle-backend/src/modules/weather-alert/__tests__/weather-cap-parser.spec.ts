import { WeatherCapParserService } from '../weather-cap-parser.service';

describe('WeatherCapParserService', () => {
  const parser = new WeatherCapParserService();

  it('parses GeoMet feature collection', () => {
    const body = {
      type: 'FeatureCollection',
      features: [
        {
          id: 'cap-1',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-114, 51],
                [-113, 51],
                [-113, 52],
                [-114, 52],
                [-114, 51],
              ],
            ],
          },
          properties: {
            identifier: 'urn:oid:1',
            event: 'snowfall',
            severity: 'Moderate',
            headline: 'Snowfall warning',
            description: 'Heavy snow expected.',
            effective: '2026-05-18T12:00:00Z',
            expires: '2026-05-19T12:00:00Z',
            geocode: [{ value: 'CA-AB-001' }],
          },
        },
      ],
    };
    const alerts = parser.parseGeometCollection(body);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].alertId).toBe('urn:oid:1');
    expect(alerts[0].zoneId).toBe('CA-AB-001');
    expect(alerts[0].headline).toContain('Snowfall');
  });

  it('extracts CAP links from warnings index HTML', () => {
    const html = '<a href="/warnings/cap/abc.xml">cap</a>';
    const links = parser.extractCapLinksFromIndexHtml(html);
    expect(links.some((l) => l.includes('abc.xml'))).toBe(true);
  });
});
