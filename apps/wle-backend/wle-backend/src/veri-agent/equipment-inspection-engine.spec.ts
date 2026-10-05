import {
  EQUIPMENT_INSPECTION_ENGINE_SYSTEM_PROMPT,
  EQUIPMENT_WALKAROUND_SECTIONS,
  EQUIPMENT_WORKFLOW_RULES,
  TRADITIONAL_CHECKLIST_SECTIONS,
  buildEquipmentSectionUserPrompt,
  buildTraditionalSectionPrompt,
  isEquipmentInspectionSectionId,
  isTraditionalChecklistSectionId,
  modeAnalyzesImages,
  modeRequiresPhotos,
  resolveEquipmentInspectionMode,
  sectionsForMode,
} from './equipment-inspection-engine';

describe('equipment-inspection-engine', () => {
  it('resolves traditional and smart_ai mode aliases', () => {
    expect(resolveEquipmentInspectionMode('traditional')).toBe('traditional');
    expect(resolveEquipmentInspectionMode('manual')).toBe('traditional');
    expect(resolveEquipmentInspectionMode('A')).toBe('traditional');
    expect(resolveEquipmentInspectionMode('smart_ai')).toBe('smart_ai');
    expect(resolveEquipmentInspectionMode('photo')).toBe('smart_ai');
    expect(resolveEquipmentInspectionMode('B')).toBe('smart_ai');
    expect(resolveEquipmentInspectionMode('unknown')).toBeNull();
  });

  it('branches photo and image analysis by mode', () => {
    expect(modeRequiresPhotos('traditional')).toBe(false);
    expect(modeAnalyzesImages('traditional')).toBe(false);
    expect(modeRequiresPhotos('smart_ai')).toBe(true);
    expect(modeAnalyzesImages('smart_ai')).toBe(true);
  });

  it('defines traditional checklist sections without photos', () => {
    expect(TRADITIONAL_CHECKLIST_SECTIONS).toHaveLength(10);
    for (const section of TRADITIONAL_CHECKLIST_SECTIONS) {
      expect(section.photoRequired).toBe(false);
    }
    expect(
      TRADITIONAL_CHECKLIST_SECTIONS.some((s) => s.id === 'final_status'),
    ).toBe(true);
  });

  it('defines 14 mandatory smart AI photo sections', () => {
    expect(EQUIPMENT_WALKAROUND_SECTIONS).toHaveLength(14);
    for (const section of EQUIPMENT_WALKAROUND_SECTIONS) {
      expect(section.photoRequired).toBe(true);
      expect(section.operatorInstruction.length).toBeGreaterThan(10);
    }
  });

  it('returns mode-specific section catalogs', () => {
    expect(sectionsForMode('traditional')).toBe(TRADITIONAL_CHECKLIST_SECTIONS);
    expect(sectionsForMode('smart_ai')).toBe(EQUIPMENT_WALKAROUND_SECTIONS);
  });

  it('includes mode-aware workflow rules', () => {
    const byId = Object.fromEntries(
      EQUIPMENT_WORKFLOW_RULES.map((r) => [r.id, r]),
    );
    expect(byId.mode_selection.modes).toContain('traditional');
    expect(byId.mode_selection.modes).toContain('smart_ai');
    expect(byId.photo_requirement.modes).toEqual(['smart_ai']);
    expect(byId.no_image_analysis_traditional.modes).toEqual(['traditional']);
    expect(byId.completion_gate.modes).toContain('traditional');
  });

  it('system prompt encodes dual modes and excludes Smart Safety', () => {
    expect(EQUIPMENT_INSPECTION_ENGINE_SYSTEM_PROMPT).toContain(
      'Equipment Inspection Engine',
    );
    expect(EQUIPMENT_INSPECTION_ENGINE_SYSTEM_PROMPT).toContain(
      'Traditional Equipment Inspection',
    );
    expect(EQUIPMENT_INSPECTION_ENGINE_SYSTEM_PROMPT).toContain(
      'Smart AI-Driven Equipment Inspection',
    );
    expect(EQUIPMENT_INSPECTION_ENGINE_SYSTEM_PROMPT).toContain(
      'inspection reporting',
    );
    expect(EQUIPMENT_INSPECTION_ENGINE_SYSTEM_PROMPT).toContain(
      'NEVER perform Smart Safety Inspections',
    );
    expect(EQUIPMENT_INSPECTION_ENGINE_SYSTEM_PROMPT).toContain('defectType');
    expect(EQUIPMENT_INSPECTION_ENGINE_SYSTEM_PROMPT).toContain('confidence');
  });

  it('validates section ids per mode', () => {
    expect(isEquipmentInspectionSectionId('front_view')).toBe(true);
    expect(isEquipmentInspectionSectionId('general_condition')).toBe(false);
    expect(isTraditionalChecklistSectionId('general_condition')).toBe(true);
    expect(isTraditionalChecklistSectionId('front_view')).toBe(false);
  });

  it('builds smart AI section prompts with MODE marker', () => {
    const prompt = buildEquipmentSectionUserPrompt('hydraulic_hoses', {
      caption: 'Seepage near fitting',
      assetType: 'excavator',
    });
    expect(prompt).toContain('MODE: smart_ai');
    expect(prompt).toContain('Hydraulic Hoses');
    expect(prompt).toContain('excavator');
    expect(prompt).toContain('equipment defects only');
  });

  it('builds traditional prompts that forbid image analysis', () => {
    const prompt = buildTraditionalSectionPrompt('hydraulics', {
      observations: 'Slight oil film on fitting',
      assetType: 'loader',
    });
    expect(prompt).toContain('MODE: traditional');
    expect(prompt).toContain('Do NOT analyze images');
    expect(prompt).toContain('Hydraulics');
    expect(prompt).toContain('Slight oil film');
  });
});
