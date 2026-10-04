import { FULL_CONTROL_SEED, FULL_HAZARD_SEED } from './jha-library-seed';
import { suggestJhaLibrary } from './jha-suggestion.engine';

describe('suggestJhaLibrary', () => {
  it('ranks ladder/scaffold hazards for elevated work tasks', () => {
    const result = suggestJhaLibrary({
      taskDescription: 'Replace scaffold planking at elevation',
      selectedHazardCategories: [],
      selectedEnergyTypes: [],
      existingHazardDescriptions: [],
      existingControlDescriptions: [],
      hazardLibrary: FULL_HAZARD_SEED,
      controlLibrary: FULL_CONTROL_SEED,
    });

    expect(result.suggestedHazards.length).toBeGreaterThan(0);
    const top = result.suggestedHazards[0];
    expect(top.category).toBe('Fall');
    expect(top.score).toBeGreaterThan(0);
    expect(top.description.toLowerCase()).toMatch(
      /ladder|scaffold|platform|fall/,
    );
  });

  it('boosts weather hazards when site conditions mention ice', () => {
    const result = suggestJhaLibrary({
      taskDescription: 'Walkdown inspection',
      weather: 'Ice on walkways',
      selectedHazardCategories: [],
      selectedEnergyTypes: [],
      existingHazardDescriptions: [],
      existingControlDescriptions: [],
      hazardLibrary: FULL_HAZARD_SEED,
      controlLibrary: FULL_CONTROL_SEED,
    });

    const weatherHit = result.suggestedHazards.find(
      (h) => h.category === 'Weather',
    );
    expect(weatherHit?.score).toBeGreaterThanOrEqual(8);
  });

  it('prefers higher-order controls for selected hazard categories', () => {
    const result = suggestJhaLibrary({
      taskDescription: '',
      selectedHazardCategories: ['Electrical'],
      selectedEnergyTypes: ['electrical'],
      existingHazardDescriptions: [],
      existingControlDescriptions: [],
      hazardLibrary: FULL_HAZARD_SEED,
      controlLibrary: FULL_CONTROL_SEED,
    });

    expect(result.suggestedControls.length).toBeGreaterThan(0);
    const topTypes = result.suggestedControls
      .slice(0, 5)
      .map((c) => c.controlType);
    expect(
      topTypes.some((t) =>
        ['elimination', 'engineering', 'administrative'].includes(t),
      ),
    ).toBe(true);
  });

  it('excludes hazards and controls already on the form', () => {
    const existing = FULL_HAZARD_SEED[0].description;
    const result = suggestJhaLibrary({
      taskDescription: 'ladder work',
      selectedHazardCategories: [],
      selectedEnergyTypes: [],
      existingHazardDescriptions: [existing],
      existingControlDescriptions: [FULL_CONTROL_SEED[0].description],
      hazardLibrary: FULL_HAZARD_SEED,
      controlLibrary: FULL_CONTROL_SEED,
    });

    expect(
      result.suggestedHazards.some((h) => h.description === existing),
    ).toBe(false);
    expect(
      result.suggestedControls.some(
        (c) => c.description === FULL_CONTROL_SEED[0].description,
      ),
    ).toBe(false);
  });

  it('warns when energy wheel selection lacks required control types', () => {
    const result = suggestJhaLibrary({
      taskDescription: '',
      selectedHazardCategories: ['Electrical'],
      selectedEnergyTypes: ['electrical'],
      existingHazardDescriptions: [],
      existingControlDescriptions: [],
      hazardLibrary: [],
      controlLibrary: FULL_CONTROL_SEED.filter((c) => c.controlType === 'ppe'),
    });

    expect(
      result.warnings.some(
        (w) => w.includes('electrical') || w.includes('Electrical'),
      ),
    ).toBe(true);
  });

  it('boosts controls for focused hazard category', () => {
    const result = suggestJhaLibrary({
      selectedHazardCategories: ['Electrical'],
      selectedEnergyTypes: [],
      existingHazardDescriptions: [],
      existingControlDescriptions: [],
      focusedHazardCategory: 'Electrical',
      hazardLibrary: FULL_HAZARD_SEED,
      controlLibrary: FULL_CONTROL_SEED,
    });

    const electricalControls = result.suggestedControls.filter((c) =>
      c.hazardCategories.includes('Electrical'),
    );
    expect(electricalControls.length).toBeGreaterThan(0);
    expect(electricalControls[0].reason).toContain('selected hazard');
  });

  it('boosts hazards from project learnings', () => {
    const learnedDesc = FULL_HAZARD_SEED[0].description;
    const result = suggestJhaLibrary({
      selectedHazardCategories: [],
      selectedEnergyTypes: [],
      existingHazardDescriptions: [],
      existingControlDescriptions: [],
      hazardLibrary: FULL_HAZARD_SEED,
      controlLibrary: FULL_CONTROL_SEED,
      projectLearnings: {
        approvedFormCount: 5,
        hazards: [
          { description: learnedDesc, category: 'Fall', count: 4, reason: '' },
        ],
        controls: [],
      },
    });

    const hit = result.suggestedHazards.find(
      (h) => h.description === learnedDesc,
    );
    expect(hit?.score).toBeGreaterThan(6);
    expect(result.crewOftenAdds?.hazards.length).toBeGreaterThan(0);
  });
});
