import { apiFetchJson } from "@/lib/api-fetch";
import type {
  ProviderStorefrontPost,
  ProviderStorefrontProfile,
} from "@vera/api-contract";

export async function fetchProviderStorefront(
  providerId: number
): Promise<ProviderStorefrontProfile> {
  return apiFetchJson<ProviderStorefrontProfile>(
    `/api/v1/social/providers/profile/${providerId}`,
    { requireAuth: false }
  );
}

export async function fetchProviderPosts(
  providerId: number,
  limit = 20
): Promise<ProviderStorefrontPost[]> {
  return apiFetchJson<ProviderStorefrontPost[]>(
    `/api/v1/social/providers/${providerId}/posts?limit=${limit}`,
    { requireAuth: false }
  );
}
