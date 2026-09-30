import type { EmergencyQuickAccessPack } from "./types";
import { quickAccessCacheKey } from "./types";

export function saveQuickAccessOffline(pack: EmergencyQuickAccessPack): void {
  if (typeof window === "undefined") return;
  try {
    const key = quickAccessCacheKey(pack.projectId, pack.companyId);
    localStorage.setItem(
      key,
      JSON.stringify({
        savedAt: new Date().toISOString(),
        pack,
      }),
    );
  } catch {
    /* quota / private mode — ignore */
  }
}

export function readQuickAccessOffline(
  projectId: number,
  companyId: number,
): { savedAt: string; pack: EmergencyQuickAccessPack } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(quickAccessCacheKey(projectId, companyId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      savedAt?: string;
      pack?: EmergencyQuickAccessPack;
    };
    if (!parsed?.pack || parsed.pack.documentType !== "EMERGENCY_QUICK_ACCESS") {
      return null;
    }
    return {
      savedAt: parsed.savedAt ?? packGeneratedFallback(parsed.pack),
      pack: parsed.pack,
    };
  } catch {
    return null;
  }
}

function packGeneratedFallback(pack: EmergencyQuickAccessPack) {
  return pack.generatedAt;
}

export function clearQuickAccessOffline(
  projectId: number,
  companyId: number,
): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(quickAccessCacheKey(projectId, companyId));
}

export function isBrowserOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}
