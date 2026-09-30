import { describe, it, expect } from 'vitest';
import {
  hazardExtractionEngine,
  controlExtractionEngine,
  expiryEngine,
  zoneEnforcementEngine,
} from '../../src/engines/sds.engine';

describe('hazard extraction engine', () => {
  it('extracts hazards from WHMIS classification', () => {
    const hazards = hazardExtractionEngine.extract({
      whmisClassification: 'Flammable liquid Category 2; Toxic',
      casNumber: '67-64-1',
    });
    expect(hazards.some((h) => h.code === 'FLAMMABLE')).toBe(true);
    expect(hazards.some((h) => h.code === 'TOXIC')).toBe(true);
  });
});

describe('control extraction engine', () => {
  it('extracts PPE controls', () => {
    const controls = controlExtractionEngine.extract({
      ppeRequirements: ['safety glasses', 'nitrile gloves'],
      handlingStorage: { ventilation: 'Use local exhaust' },
    });
    expect(controls.filter((c) => c.type === 'ppe').length).toBeGreaterThanOrEqual(2);
    expect(controls.some((c) => c.type === 'engineering')).toBe(true);
  });
});

describe('expiry engine', () => {
  it('detects expired SDS', () => {
    expect(expiryEngine.isExpired(new Date('2020-01-01'), new Date('2026-01-01'))).toBe(true);
  });

  it('detects expiring soon', () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 10);
    expect(expiryEngine.isExpiringSoon(soon)).toBe(true);
  });
});

describe('zone enforcement engine', () => {
  it('flags missing acknowledgments', () => {
    const result = zoneEnforcementEngine.evaluate({
      requiredSdsIds: ['sds-1', 'sds-2'],
      acknowledgedSdsIds: new Set(['sds-1']),
      expiredSdsIds: new Set(),
    });
    expect(result.compliant).toBe(false);
    expect(result.missingSds).toContain('sds-2');
  });
});
