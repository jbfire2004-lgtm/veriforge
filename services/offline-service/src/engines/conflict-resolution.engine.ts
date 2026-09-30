import type { ConflictResolutionStrategy } from '../types';

export class ConflictResolutionEngine {
  resolve(input: {
    strategy: ConflictResolutionStrategy;
    localValue: Record<string, unknown>;
    serverValue: Record<string, unknown>;
    merge?: Record<string, unknown>;
  }): Record<string, unknown> {
    if (input.strategy === 'prefer_local') return { ...input.localValue };
    if (input.strategy === 'prefer_server') return { ...input.serverValue };
    return {
      ...input.serverValue,
      ...input.localValue,
      ...(input.merge ?? {}),
    };
  }

  isConflictError(message?: string): boolean {
    if (!message) return false;
    return /conflict|version|duplicate|already exists|stale/i.test(message);
  }
}

export const conflictResolutionEngine = new ConflictResolutionEngine();
