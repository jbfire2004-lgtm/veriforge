import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  credentialStatusLabel,
  resolveCredentialOffline,
} from "../workflows/offline-credential";
import type { LocalCacheStore } from "../cache-store";

function mockCache(records: Record<string, unknown>[]) {
  const qr = new Map<string, { entityId?: number }>();
  return {
    getQrRegistry: vi.fn(async (id: string) => qr.get(id) ?? null),
    putQrRegistry: vi.fn(async (entry: { id: string; entityId?: number }) => {
      qr.set(entry.id, entry);
    }),
    get: vi.fn(async (_type: string, id: number) => {
      const row = records.find((r) => r.id === id);
      return row ? { data: row } : null;
    }),
    listByType: vi.fn(async () =>
      records.map((data) => ({ data })),
    ),
  } as unknown as LocalCacheStore;
}

describe("resolveCredentialOffline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns cached credential via registry", async () => {
    const cache = mockCache([
      {
        id: 42,
        certificateQrToken: "cert_abc",
        lastVerificationStatus: "VERIFIED",
        certification: { id: 1, name: "Fall Protection" },
      },
    ]);
    await cache.putQrRegistry({
      id: "cert:cert_abc",
      kind: "credential",
      entityId: 42,
      cachedAt: new Date().toISOString(),
    });

    const result = await resolveCredentialOffline(cache, "cert_abc");
    expect(result.status).toBe("cached");
    if (result.status === "cached") {
      expect(result.credential.id).toBe(42);
    }
  });

  it("returns offline_unknown when not cached", async () => {
    const cache = mockCache([]);
    const result = await resolveCredentialOffline(cache, "cert_missing");
    expect(result.status).toBe("offline_unknown");
  });
});

describe("credentialStatusLabel", () => {
  it("labels verified credentials", () => {
    expect(
      credentialStatusLabel({
        id: 1,
        lastVerificationStatus: "VERIFIED",
        certification: { id: 1, name: "Confined Space" },
      }),
    ).toContain("verified");
  });
});
