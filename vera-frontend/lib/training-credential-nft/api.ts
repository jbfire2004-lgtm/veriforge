import type { VerifiedByVeraProjection } from "@vera/api-contract";
import { apiFetchJson } from "@/lib/api-fetch";

const BASE = "/api/v1/training-credential-nft";

export async function fetchVerifiedByVeraProjection(
  trainingRecordId: number,
): Promise<VerifiedByVeraProjection> {
  return apiFetchJson<VerifiedByVeraProjection>(
    `${BASE}/projection/training/${trainingRecordId}`,
  );
}

export async function retryTrainingCredentialNftMint(
  trainingRecordId: number,
): Promise<void> {
  await apiFetchJson(`${BASE}/training/${trainingRecordId}/retry-mint`, {
    method: "POST",
  });
}
