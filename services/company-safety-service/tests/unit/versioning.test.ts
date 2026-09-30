import { describe, it, expect } from 'vitest';
import { versioningEngine } from '../../src/engines/versioning.engine';

describe('versioning engine', () => {
  it('increments version', () => {
    expect(versioningEngine.nextVersion(3)).toBe(4);
  });

  it('generates unique hazard ids', () => {
    const a = versioningEngine.newHazardId();
    const b = versioningEngine.newHazardId();
    expect(a).not.toBe(b);
  });
});
