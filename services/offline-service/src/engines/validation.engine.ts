import { env } from '../config/env';
import { logger } from '../utils/logger';

const REQUIRED: Record<string, string[]> = {
  'pm-hazard': ['clientSyncId'],
  'pm-control': ['clientSyncId'],
  'pm-corrective-action': ['clientSyncId'],
  'pm-inspection': ['clientSyncId'],
  'pm-incident': ['clientSyncId'],
  'pm-training': ['clientSyncId'],
  'pm-project': ['projectId'],
  'pm-cail': ['clientSyncId'],
};

export class ValidationEngine {
  validateLocal(moduleType: string, payload: Record<string, unknown>): string[] {
    const errors: string[] = [];
    if (!moduleType?.trim()) errors.push('module type is required');

    const required = REQUIRED[moduleType];
    if (required) {
      for (const key of required) {
        if (payload[key] == null || payload[key] === '') {
          errors.push(`Missing required field: ${key}`);
        }
      }
    }
    return errors;
  }

  async validateWithHook(
    moduleType: string,
    payload: Record<string, unknown>,
  ): Promise<string[]> {
    const localErrors = this.validateLocal(moduleType, payload);
    if (localErrors.length > 0) return localErrors;

    if (!env.validationHookUrl) return [];

    try {
      const res = await fetch(env.validationHookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleType, payload }),
        signal: AbortSignal.timeout(5000),
      });
      const body = (await res.json()) as { valid?: boolean; errors?: string[] };
      if (!res.ok || body.valid === false) {
        return body.errors ?? ['Validation hook rejected payload'];
      }
    } catch (err) {
      logger.warn('validation hook failed', {
        moduleType,
        error: err instanceof Error ? err.message : String(err),
      });
    }
    return [];
  }
}

export const validationEngine = new ValidationEngine();
