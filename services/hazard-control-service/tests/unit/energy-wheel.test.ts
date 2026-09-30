import { describe, it, expect } from 'vitest';
import { energyWheelEngine } from '../../src/engines/energy-wheel.engine';

describe('energy wheel', () => {
  it('detects electrical energy from text', () => {
    const d = energyWheelEngine.detectFromText('Worker near energized electrical panel');
    expect(d.some((e) => e.energyType === 'electrical')).toBe(true);
  });

  it('suggests controls for energy types', () => {
    const s = energyWheelEngine.suggestControlDescriptions(['gravity', 'electrical']);
    expect(s.length).toBeGreaterThan(0);
  });
});
