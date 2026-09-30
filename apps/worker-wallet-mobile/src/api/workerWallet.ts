import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001";
const TOKEN_KEY = "vera_wallet_token";
const BUNDLE_KEY = "vera_wallet_bundle";

export type WalletTraining = {
  id: number;
  certification?: { name?: string; code?: string };
  expiresAt?: string | null;
  verifiedByVeraStatus?: string;
  nftTokenId?: string | null;
  daysUntilExpiry?: number | null;
};

export type WalletBundle = {
  syncedAt: string;
  workerId: number;
  training: WalletTraining[];
  readiness: { score?: number; state?: string } | null;
  projects: Array<{ projectId: number; projectName: string }>;
  qr: { content: string; verifyUrl: string };
};

function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.ceil(ms / 86_400_000);
}

export async function setAuthToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function fetchWalletBundle(workerId: number): Promise<WalletBundle> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${API_BASE}/api/v1/worker-wallet/bundle/${workerId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Bundle fetch failed: ${res.status}`);
  const raw = await res.json();
  const training = (raw.training ?? []).map((t: WalletTraining) => ({
    ...t,
    daysUntilExpiry: daysUntil(t.expiresAt ?? null),
  }));
  const bundle: WalletBundle = {
    syncedAt: raw.syncedAt,
    workerId: raw.workerId,
    training,
    readiness: raw.readiness,
    projects: raw.projects ?? [],
    qr: raw.qr ?? { content: "", verifyUrl: "" },
  };
  await AsyncStorage.setItem(BUNDLE_KEY, JSON.stringify(bundle));
  return bundle;
}

export async function loadCachedBundle(): Promise<WalletBundle | null> {
  const raw = await AsyncStorage.getItem(BUNDLE_KEY);
  return raw ? (JSON.parse(raw) as WalletBundle) : null;
}

export async function validateBlockchain(tokenId: string, trainingRecordId?: number) {
  const q = trainingRecordId ? `?trainingRecordId=${trainingRecordId}` : "";
  const res = await fetch(
    `${API_BASE}/api/v1/worker-wallet/blockchain/validate/${encodeURIComponent(tokenId)}${q}`,
  );
  if (!res.ok) throw new Error("Blockchain validation failed");
  return res.json() as Promise<{ valid: boolean; message: string }>;
}
