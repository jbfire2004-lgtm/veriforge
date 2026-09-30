import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchExpertProfile } from "@/lib/expert-qa/api";
import { fetchSeoSchema } from "@/lib/seo/api";
import { loadPageSeo, jsonLdScriptTag } from "@/lib/seo/page-seo";

type Props = { params: Promise<{ userId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const userId = parseInt((await params).userId, 10);
  if (Number.isNaN(userId)) return { title: "Expert profile" };
  try {
    const { metadata } = await loadPageSeo({ type: "PROFILE", userId });
    return metadata;
  } catch {
    return { title: "Expert profile" };
  }
}

export default async function ExpertProfilePage({ params }: Props) {
  const userId = parseInt((await params).userId, 10);
  if (Number.isNaN(userId)) notFound();

  const profile = await fetchExpertProfile(userId).catch(() => null);
  if (!profile) notFound();

  let jsonLd: Record<string, unknown> | null = null;
  try {
    jsonLd = await fetchSeoSchema({ type: "PROFILE", userId });
  } catch {
    jsonLd = null;
  }

  return (
    <article className="space-y-vera-8 max-w-2xl">
      {jsonLd ? jsonLdScriptTag(jsonLd) : null}
      <header className="space-y-vera-2">
        <h1 className="text-2xl font-semibold text-vera-deep">{profile.displayName}</h1>
        {profile.headline ? <p className="text-vera-muted">{profile.headline}</p> : null}
        {profile.trade ? (
          <p className="text-sm text-vera-muted">
            {profile.trade}
            {profile.verified ? " · Verified expert" : ""}
          </p>
        ) : null}
      </header>
      {profile.bio ? (
        <section className="prose max-w-none text-sm whitespace-pre-wrap">{profile.bio}</section>
      ) : null}
      <p className="text-sm text-vera-muted">
        {profile.answerCount} answers · {profile.acceptedCount} accepted · Reputation{" "}
        {profile.reputationScore}
      </p>
    </article>
  );
}
