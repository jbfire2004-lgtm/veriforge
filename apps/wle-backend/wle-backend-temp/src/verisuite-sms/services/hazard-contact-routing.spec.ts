import { routeHazardContacts } from './hazard-contact-routing';

describe('hazard-specific contact routing', () => {
  it('routes gas line strike to SaskEnergy in Saskatchewan', () => {
    const routed = routeHazardContacts({
      regionCode: 'CA-SK',
      hazards: ['gas_line_strike'],
    });
    expect(routed.summary[0]).toMatch(/SaskEnergy/i);
    const primary = routed.contacts.find((c) => c.priority === 1);
    expect(primary?.phone).toBe('1-888-700-0421');
    expect(primary?.reason).toMatch(/SaskEnergy/i);
  });

  it('routes electrical strike to SaskPower (SK) and ATCO Electric (AB)', () => {
    const sk = routeHazardContacts({
      regionCode: 'CA-SK',
      hazards: ['electrical_strike'],
    });
    expect(sk.contacts.some((c) => c.phone === '310-2220')).toBe(true);
    expect(sk.contacts.some((c) => /SaskPower/i.test(c.name))).toBe(true);
    expect(sk.contacts.some((c) => c.phone === '1-800-668-5506')).toBe(true);

    const ab = routeHazardContacts({
      regionCode: 'CA-AB',
      hazards: ['electrical_strike'],
    });
    const primary = ab.contacts.find((c) => c.priority === 1);
    expect(primary?.name).toMatch(/ATCO Electric/i);
    expect(primary?.phone).toBe('1-800-668-5506');
  });

  it('routes hazardous release to provincial OHS + local fire (911)', () => {
    const routed = routeHazardContacts({
      regionCode: 'CA-SK',
      hazards: ['hazardous_release'],
    });
    expect(routed.contacts.some((c) => c.role === 'provincial_ohs')).toBe(true);
    expect(
      routed.contacts.find((c) => c.role === 'provincial_ohs')?.phone,
    ).toBeNull();
    const fire = routed.contacts.find((c) => c.role === 'local_fire');
    expect(fire?.phone).toBe('911');
    expect(fire?.reason).toMatch(/local fire/i);
  });

  it('infers hazards from narrative text', () => {
    const routed = routeHazardContacts({
      regionCode: 'CA-SK',
      text: 'excavator hit gas line and chemical spill hazardous release',
    });
    expect(routed.hazards).toEqual(
      expect.arrayContaining(['gas_line_strike', 'hazardous_release']),
    );
  });
});
