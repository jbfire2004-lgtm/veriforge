import { env } from '../config/env';
import type { CachedModel } from '../types';

const cache = new Map<string, CachedModel>();

export const modelCache = {
  key(modelId: string, version: number): string {
    return `${modelId}:v${version}`;
  },

  get(modelId: string, version: number): CachedModel | undefined {
    const entry = cache.get(this.key(modelId, version));
    if (!entry) return undefined;
    if (Date.now() - entry.loadedAt > env.modelCacheTtlMs) {
      cache.delete(this.key(modelId, version));
      return undefined;
    }
    return entry;
  },

  load(modelId?: string, version?: number): CachedModel {
    const id = modelId ?? env.defaultModelId;
    const ver = version ?? env.defaultModelVersion;
    const existing = this.get(id, ver);
    if (existing) return existing;

    const entry: CachedModel = {
      modelId: id,
      version: ver,
      algorithm: 'deterministic_rules_v1',
      loadedAt: Date.now(),
    };
    cache.set(this.key(id, ver), entry);
    return entry;
  },

  clear() {
    cache.clear();
  },

  size() {
    return cache.size;
  },
};
