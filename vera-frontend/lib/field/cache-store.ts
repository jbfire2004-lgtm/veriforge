import { decryptJson, encryptJson, encryptBlob, decryptBlob } from "./crypto";
import { getFieldDb } from "./db";
import type {
  CacheEntityType,
  CachedEntity,
  QrRegistryEntry,
} from "./types";
import { DEFAULT_CACHE_POLICY, isExpired } from "./cache-policies";

function cacheKey(type: CacheEntityType, id: string | number): string {
  return `${type}:${id}`;
}

/**
 * Encrypted local cache (§2) — IndexedDB + AES-256-GCM payloads.
 */
export class LocalCacheStore {
  constructor(private readonly cryptoKey: CryptoKey) {}

  static async create(cryptoKey: CryptoKey): Promise<LocalCacheStore> {
    await getFieldDb();
    return new LocalCacheStore(cryptoKey);
  }

  async put<T>(
    type: CacheEntityType,
    id: string | number,
    data: T,
    options?: { ttlMs?: number; version?: number; etag?: string }
  ): Promise<CachedEntity<T>> {
    const policy = DEFAULT_CACHE_POLICY[type];
    const ttl = options?.ttlMs ?? policy?.ttlMs;
    const now = new Date();
    const entry: CachedEntity<T> = {
      key: cacheKey(type, id),
      type,
      version: options?.version ?? 1,
      updatedAt: now.toISOString(),
      expiresAt: ttl ? new Date(now.getTime() + ttl).toISOString() : undefined,
      etag: options?.etag,
      data,
    };

    const payload = await encryptJson(this.cryptoKey, entry);
    const db = await getFieldDb();
    await db.put(
      "cache",
      {
        type,
        version: entry.version,
        updatedAt: entry.updatedAt,
        expiresAt: entry.expiresAt,
        payload,
      },
      entry.key
    );
    return entry;
  }

  async get<T>(type: CacheEntityType, id: string | number): Promise<CachedEntity<T> | null> {
    const db = await getFieldDb();
    const row = await db.get("cache", cacheKey(type, id));
    if (!row) return null;
    const entry = await decryptJson<CachedEntity<T>>(this.cryptoKey, row.payload);
    if (isExpired(entry.expiresAt)) {
      await this.delete(type, id);
      return null;
    }
    return entry;
  }

  async delete(type: CacheEntityType, id: string | number): Promise<void> {
    const db = await getFieldDb();
    await db.delete("cache", cacheKey(type, id));
  }

  async listByType<T>(type: CacheEntityType): Promise<CachedEntity<T>[]> {
    const db = await getFieldDb();
    const all = await db.getAll("cache");
    const out: CachedEntity<T>[] = [];
    for (const row of all) {
      if (row.type !== type) continue;
      try {
        const entry = await decryptJson<CachedEntity<T>>(this.cryptoKey, row.payload);
        if (!isExpired(entry.expiresAt)) out.push(entry);
      } catch {
        /* skip corrupt */
      }
    }
    return out;
  }

  async putBlob(id: string, blob: Blob): Promise<void> {
    const encrypted = await encryptBlob(this.cryptoKey, blob);
    const db = await getFieldDb();
    await db.put(
      "blobs",
      {
        mime: blob.type,
        updatedAt: new Date().toISOString(),
        payload: encrypted,
      },
      id
    );
  }

  async getBlob(id: string): Promise<Blob | null> {
    const db = await getFieldDb();
    const row = await db.get("blobs", id);
    if (!row) return null;
    return decryptBlob(this.cryptoKey, row.payload);
  }

  async putQrRegistry(entry: QrRegistryEntry): Promise<void> {
    const db = await getFieldDb();
    await db.put("qr_registry", entry, entry.id);
  }

  async getQrRegistry(id: string): Promise<QrRegistryEntry | null> {
    const db = await getFieldDb();
    return (await db.get("qr_registry", id)) ?? null;
  }

  async listQrRegistry(): Promise<QrRegistryEntry[]> {
    const db = await getFieldDb();
    return db.getAll("qr_registry");
  }

  async setMeta(key: string, value: string): Promise<void> {
    const db = await getFieldDb();
    await db.put("meta", key, value);
  }

  async getMeta(key: string): Promise<string | undefined> {
    const db = await getFieldDb();
    return db.get("meta", key);
  }
}
