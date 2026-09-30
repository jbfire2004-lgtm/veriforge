import type { LocalCacheStore } from "./cache-store";

export type CachedCredentialSummary = {
  id: number;
  workerId?: number;
  certificateQrToken?: string | null;
  lastVerificationStatus?: string | null;
  expiresAt?: string | null;
  issuedAt?: string | null;
  certification?: { id: number; name: string; code?: string | null };
  worker?: { id: number; firstName: string; lastName: string };
};

export type OfflineCredentialResult =
  | { status: "cached"; credential: CachedCredentialSummary }
  | { status: "offline_unknown"; message: string };

const OFFLINE_UNKNOWN_MESSAGE =
  "Cannot verify while offline — this credential is not in your local cache. Reconnect to verify.";

/**
 * Resolve a certificate QR token from encrypted local cache.
 */
export async function resolveCredentialOffline(
  cache: LocalCacheStore,
  token: string,
): Promise<OfflineCredentialResult> {
  const normalized = token.trim();
  const registry = await cache.getQrRegistry(`cert:${normalized}`);
  if (registry?.entityId != null) {
    const row = await cache.get<CachedCredentialSummary>(
      "trainingRecord",
      registry.entityId,
    );
    if (row?.data) {
      return { status: "cached", credential: row.data };
    }
  }

  const all = await cache.listByType<CachedCredentialSummary>("trainingRecord");
  const match = all.find(
    (r) => r.data.certificateQrToken?.trim() === normalized,
  );
  if (match) {
    return { status: "cached", credential: match.data };
  }

  return { status: "offline_unknown", message: OFFLINE_UNKNOWN_MESSAGE };
}

export function credentialStatusLabel(
  credential: CachedCredentialSummary,
): string {
  const status = credential.lastVerificationStatus ?? "UNKNOWN";
  const name = credential.certification?.name ?? "Credential";
  if (status === "VERIFIED") return `${name} — verified (cached)`;
  if (status === "ATTENTION") return `${name} — needs attention (cached)`;
  if (status === "INVALID") return `${name} — invalid (cached)`;
  const exp = credential.expiresAt ? Date.parse(credential.expiresAt) : NaN;
  if (!Number.isNaN(exp) && exp < Date.now()) {
    return `${name} — expired (cached)`;
  }
  return `${name} — cached offline snapshot`;
}
