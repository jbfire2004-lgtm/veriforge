import {
  parseSupervisorQrText,
  type ParsedSupervisorQr,
  type SupervisorScanMode,
} from "@/lib/core/field-scan";
import type { LocalCacheStore } from "../cache-store";
import type { SyncQueue } from "../sync-queue";
import type { QrRegistryEntry } from "../types";
import {
  credentialStatusLabel,
  resolveCredentialOffline,
} from "./offline-credential";

export type OfflineQrMatch =
  | { status: "cached"; kind: "worker" | "equipment"; entityId: number; label?: string }
  | {
      status: "cached_credential";
      credentialId: number;
      label: string;
      verificationHint: string;
    }
  | { status: "offline_unknown_credential"; message: string }
  | { status: "temp"; tempId: string; parsed: ParsedSupervisorQr }
  | { status: "unknown"; reason: string };

/**
 * Offline QR scan — decode locally, match registry (§3.1).
 */
export async function scanQrOffline(
  text: string,
  mode: SupervisorScanMode,
  cache: LocalCacheStore,
  queue: SyncQueue
): Promise<OfflineQrMatch> {
  const parsed = parseSupervisorQrText(text, mode);
  if (!parsed.ok) {
    return { status: "unknown", reason: parsed.reason };
  }

  if (parsed.kind === "certificate") {
    const resolved = await resolveCredentialOffline(cache, parsed.token);
    if (resolved.status === "cached") {
      return {
        status: "cached_credential",
        credentialId: resolved.credential.id,
        label: credentialStatusLabel(resolved.credential),
        verificationHint: "Showing cached credential snapshot — reconnect to verify live.",
      };
    }
    return {
      status: "offline_unknown_credential",
      message: resolved.message,
    };
  }

  const registryKey = qrRegistryKey(parsed);
  const existing = await cache.getQrRegistry(registryKey);

  if (existing?.entityId != null) {
    return {
      status: "cached",
      kind: existing.kind,
      entityId: existing.entityId,
      label: existing.label,
    };
  }

  if (parsed.kind === "worker" || parsed.kind === "equipment") {
    const cached = await cache.get<{ id: number; label?: string }>(
      parsed.kind,
      parsed.id
    );
    if (cached) {
      await cache.putQrRegistry({
        id: registryKey,
        kind: parsed.kind,
        entityId: parsed.id,
        label: cached.data.label,
        cachedAt: new Date().toISOString(),
      });
      return {
        status: "cached",
        kind: parsed.kind,
        entityId: parsed.id,
        label: cached.data.label,
      };
    }
  }

  const tempId = `temp_${Date.now()}`;
  await cache.putQrRegistry({
    id: registryKey,
    kind: parsed.kind === "equipment" ? "equipment" : "worker",
    tempOfflineId: tempId,
    cachedAt: new Date().toISOString(),
  });

  await queue.enqueue("qr.tempRecord", {
    tempId,
    raw: text,
    parsed,
    mode,
  });

  return { status: "temp", tempId, parsed };
}

function qrRegistryKey(parsed: Extract<ParsedSupervisorQr, { ok: true }>): string {
  if (parsed.kind === "worker") return `w:${parsed.id}`;
  if (parsed.kind === "equipment") return `e:${parsed.id}`;
  if (parsed.kind === "combined_pair") return `c:${parsed.workerId}:${parsed.equipmentId}`;
  return `cert:${parsed.token}`;
}
