import { describe, it, expect } from 'vitest';
import { validationEngine } from '../../src/engines/validation.engine';

describe('validation engine', () => {
  it('requires clientSyncId for pm-hazard', () => {
    const errors = validationEngine.validateLocal('pm-hazard', {});
    expect(errors.length).toBeGreaterThan(0);
  });

  it('passes valid payload', () => {
    const errors = validationEngine.validateLocal('pm-hazard', {
      clientSyncId: 'abc',
    });
    expect(errors).toHaveLength(0);
  });
});
