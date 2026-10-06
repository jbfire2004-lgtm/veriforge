import { CsraHecaEngine } from './csra-heca.engine';

describe('CsraHecaEngine', () => {
  const engine = new CsraHecaEngine();

  it('identifies high-energy electrical sources and requires Direct controls', () => {
    const out = engine.assess({
      title: 'Energized panel troubleshooting',
      description: 'Work on energized 480V electrical panel inside MCC',
      workScope: 'Open panel, diagnose, close',
      proximity: 'contact',
      exposureLevel: 4,
      controls: [
        {
          description: 'Arc-rated PPE',
          controlType: 'ppe',
          adequate: true,
        },
      ],
    });

    expect(out.methodology).toBe('CSRA');
    expect(out.highEnergySources.some((e) => e.type === 'electrical')).toBe(
      true,
    );
    expect(out.controls.directCount).toBe(0);
    expect(out.controls.alternativeCount).toBe(1);
    expect(out.sifPotential.applies).toBe(true);
    expect(
      out.recommendations.some((r) => r.controlClass === 'direct'),
    ).toBe(true);
    expect(out.document.documentType).toBe('HECA_CSRA');
    expect(out.document.sections.length).toBeGreaterThanOrEqual(6);
    expect(out.document.summary.readyForWork).toBe(false);
  });

  it('marks assessment ready when Direct LOTO control is present', () => {
    const out = engine.assess({
      title: 'Panel maintenance',
      description: 'Electrical lockout on de-energized circuit',
      energyTypes: ['electrical'],
      proximity: 'near',
      exposureLevel: 3,
      controls: [
        {
          description: 'Verified LOTO / zero-energy state before panel work',
          controlType: 'engineering',
          adequate: true,
          verified: true,
          energyTypes: ['electrical'],
        },
      ],
    });

    expect(out.controls.directCount).toBeGreaterThanOrEqual(1);
    expect(out.controls.hasDirectForHighEnergy).toBe(true);
    expect(out.document.summary.missingDirectControls).toBe(0);
  });

  it('evaluates gravity exposure from fall language', () => {
    const out = engine.assess({
      title: 'Scaffold deck work',
      workScope: 'Work at height on scaffold leading edge',
      locationNote: 'Third elevation',
    });

    expect(out.highEnergySources.some((e) => e.type === 'gravity')).toBe(true);
    expect(out.exposure.level).toBeGreaterThanOrEqual(2);
    expect(out.sifPotential.indicators.length).toBeGreaterThan(0);
  });
});
