import { getCompleteCatalog } from './jha-library-catalog';
import { analyzeJhaGaps } from './jha-gap-analysis.engine';

describe('analyzeJhaGaps', () => {
  const catalog = getCompleteCatalog();

  it('flags missing hot-work hazards when task mentions welding', () => {
    const result = analyzeJhaGaps({
      taskDescription: 'Welding structural steel on scaffold',
      existingHazardDescriptions: ['Slip, trip, or fall on same level'],
      existingHazardCategories: ['Fall'],
      existingControlDescriptions: [],
      existingControlTypes: [],
      existingEnergyTypes: [],
      hazardLibrary: catalog.hazards,
      controlLibrary: catalog.controls,
    });

    expect(result.matchedProfiles).toContain('hot_work');
    expect(result.missedHazards.length).toBeGreaterThan(0);
    expect(result.requiredEnergyTypes).toEqual(
      expect.arrayContaining(['thermal', 'chemical']),
    );
  });

  it('requires energy wheel selections for matched profiles', () => {
    const result = analyzeJhaGaps({
      taskDescription: 'Electrical panel termination',
      existingHazardDescriptions: [],
      existingHazardCategories: [],
      existingControlDescriptions: [],
      existingControlTypes: [],
      existingEnergyTypes: [],
      hazardLibrary: catalog.hazards,
      controlLibrary: catalog.controls,
    });

    expect(result.matchedProfiles).toContain('electrical');
    expect(result.requiredEnergyTypes).toContain('electrical');
    expect(result.gapWarnings.some((w) => w.includes('electrical'))).toBe(true);
  });
});

describe('getCompleteCatalog', () => {
  it('includes hazards from all industry packs', () => {
    const { hazards, controls } = getCompleteCatalog();
    expect(hazards.length).toBeGreaterThan(100);
    expect(controls.length).toBeGreaterThan(80);
    expect(hazards.some((h) => h.category === 'Well control')).toBe(true);
    expect(hazards.some((h) => h.category === 'Ground control')).toBe(true);
    expect(controls.some((c) => c.controlClass === 'direct')).toBe(true);
  });
});
