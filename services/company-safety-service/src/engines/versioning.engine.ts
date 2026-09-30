import { randomUUID } from 'crypto';

export class VersioningEngine {
  nextVersion(current: number): number {
    return current + 1;
  }

  newHazardId(): string {
    return randomUUID();
  }

  newControlId(): string {
    return randomUUID();
  }
}

export const versioningEngine = new VersioningEngine();
