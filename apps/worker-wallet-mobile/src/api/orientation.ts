import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001";
const TOKEN_KEY = "vera_wallet_token";

export type OrientationProfile = {
  workerId: number;
  companyId?: number;
  projectId?: number | null;
  gatingStatus: "allowed" | "blocked" | "warning";
  requiredOrientations: Array<{
    requirementId: string;
    orientationId: string;
    title: string;
    mustCompleteBefore: string;
    version: string;
  }>;
  completedOrientations: Array<{
    completionId: string;
    orientationId: string;
    title?: string;
    completedOn?: string | null;
    expiresOn?: string | null;
    status: string;
  }>;
  missingOrientations: Array<{ title: string; orientationId: string }>;
};

async function authHeaders(): Promise<HeadersInit> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchOrientationProfile(
  workerId: number,
  companyId?: number,
): Promise<OrientationProfile> {
  const q = companyId != null ? `?companyId=${companyId}` : "";
  const res = await fetch(
    `${API_BASE}/api/v1/workers/${workerId}/orientation-profile${q}`,
    { headers: await authHeaders() },
  );
  if (!res.ok) throw new Error(`Orientation profile failed: ${res.status}`);
  return res.json() as Promise<OrientationProfile>;
}

export async function assignOrientationToWallet(input: {
  workerId: number;
  orientationId: string;
  companyId: number;
}) {
  const res = await fetch(`${API_BASE}/api/v1/delivery/orientation/assign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeaders()),
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Assign failed: ${res.status}`);
  return res.json() as Promise<{
    deepLink: string;
    walletCard: Record<string, unknown>;
  }>;
}
