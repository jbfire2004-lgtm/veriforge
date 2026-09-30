import { describe, it, expect } from 'vitest';
import { versionPromotionEngine } from '../../src/engines/version-promotion.engine';

describe('version promotion engine', () => {
  it('promotes draft to staging', () => {
    expect(versionPromotionEngine.canPromote('draft')).toBe('staging');
  });

  it('promotes staging to production', () => {
    expect(versionPromotionEngine.canPromote('staging')).toBe('production');
  });

  it('rolls back production to staging', () => {
    expect(versionPromotionEngine.canRollback('production')).toBe('staging');
  });

  it('promotes production to retired', () => {
    expect(versionPromotionEngine.canPromote('production')).toBe('retired');
  });
});
