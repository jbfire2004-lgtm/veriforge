import { describe, it, expect, beforeEach } from 'vitest';
import { modelCache } from '../../src/engines/model-cache';

describe('model cache', () => {
  beforeEach(() => {
    modelCache.clear();
  });

  it('loads and returns cached model', () => {
    const a = modelCache.load('deterministic_rules_v1', 1);
    const b = modelCache.load('deterministic_rules_v1', 1);
    expect(a).toBe(b);
    expect(modelCache.size()).toBe(1);
  });
});
