import { BadRequestError } from '../utils/errors';
import type { ModelVersionStatus } from '../types';

const PROMOTE: Record<ModelVersionStatus, ModelVersionStatus[]> = {
  draft: ['staging'],
  staging: ['production'],
  production: ['retired'],
  retired: [],
};

const ROLLBACK: Record<ModelVersionStatus, ModelVersionStatus[]> = {
  draft: [],
  staging: ['draft'],
  production: ['staging'],
  retired: ['staging'],
};

export class VersionPromotionEngine {
  canPromote(from: ModelVersionStatus): ModelVersionStatus | null {
    return PROMOTE[from][0] ?? null;
  }

  canRollback(from: ModelVersionStatus): ModelVersionStatus | null {
    return ROLLBACK[from][0] ?? null;
  }

  assertPromote(from: ModelVersionStatus) {
    if (!this.canPromote(from)) throw new BadRequestError(`Cannot promote from ${from}`);
  }

  assertRollback(from: ModelVersionStatus) {
    if (!this.canRollback(from)) throw new BadRequestError(`Cannot rollback from ${from}`);
  }
}

export const versionPromotionEngine = new VersionPromotionEngine();
