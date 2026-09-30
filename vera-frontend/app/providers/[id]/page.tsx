import { notFound } from "next/navigation";
import { API_URL } from "@/lib/api-fetch";
import { ProviderStorefrontPage } from "@/components/social-home/ProviderStorefrontPage";
import type {
  ProviderStorefrontPost,
  ProviderStorefrontProfile,
} from "@vera/api-contract";

async function loadProvider(id: number) {
  const [profileRes, postsRes] = await Promise.all([
    fetch(`${API_URL}/api/v1/social/providers/profile/${id}`, {
      cache: "no-store",
    }),
    fetch(`${API_URL}/api/v1/social/providers/${id}/posts?limit=30`, {
      cache: "no-store",
    }),
  ]);
  if (!profileRes.ok) return null;
  const profile = (await profileRes.json()) as ProviderStorefrontProfile;
  const posts = postsRes.ok
    ? ((await postsRes.json()) as ProviderStorefrontPost[])
    : [];
  return { profile, posts };
}

export default async function ProviderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) notFound();

  const data = await loadProvider(id);
  if (!data) notFound();

  return <ProviderStorefrontPage profile={data.profile} posts={data.posts} />;
}
