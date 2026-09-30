import { describe, it, expect } from 'vitest';
import { conflictResolutionEngine } from '../../src/engines/conflict-resolution.engine';

describe('conflict resolution', () => {
  const local = { title: 'Local', version: 1 };
  const server = { title: 'Server', version: 2 };

  it('prefer_local', () => {
    const r = conflictResolutionEngine.resolve({
      strategy: 'prefer_local',
      localValue: local,
      serverValue: server,
    });
    expect(r.title).toBe('Local');
  });

  it('prefer_server', () => {
    const r = conflictResolutionEngine.resolve({
      strategy: 'prefer_server',
      localValue: local,
      serverValue: server,
    });
    expect(r.title).toBe('Server');
  });

  it('merge', () => {
    const r = conflictResolutionEngine.resolve({
      strategy: 'merge',
      localValue: local,
      serverValue: server,
      merge: { merged: true },
    });
    expect(r.merged).toBe(true);
    expect(r.title).toBe('Local');
  });
});
