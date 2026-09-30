import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchWorkerProfile } from "@/lib/job-board/api";
import { loadPageSeo, jsonLdScriptTag } from "@/lib/seo/page-seo";

type Props = { params: Promise<{ workerId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const workerId = parseInt((await params).workerId, 10);
  if (Number.isNaN(workerId)) return { title: "Worker not found" };
  try {
    const { metadata } = await loadPageSeo({ type: "PROFILE", workerId });
    return metadata;
  } catch {
    try {
      const profile = await fetchWorkerProfile(workerId);
      return {
        title: `${profile.displayName} · Worker profile`,
        description: profile.headline ?? profile.bio ?? "Trades worker on Vera Job Board",
      };
    } catch {
      return { title: "Worker not found" };
    }
  }
}

export default async function WorkerProfilePage({ params }: Props) {
  const { workerId: workerIdParam } = await params;
  const workerId = parseInt(workerIdParam, 10);
  if (Number.isNaN(workerId)) notFound();

  let profile;
  try {
    profile = await fetchWorkerProfile(workerId);
  } catch {
    notFound();
  }

  let jsonLd: Record<string, unknown> | null = null;
  try {
    jsonLd = (await loadPageSeo({ type: "PROFILE", workerId })).jsonLd as Record<string, unknown>;
  } catch {
    jsonLd = null;
  }

  return (
    <article className="space-y-vera-8">
      {jsonLd ? jsonLdScriptTag(jsonLd) : null}
      <header className="space-y-vera-2">
        <p className="text-sm">
          <Link href="/jobs" className="text-vera-teal hover:underline">
            ← Job board
          </Link>
        </p>
        <h1 className="text-2xl font-semibold text-vera-deep">{profile.displayName}</h1>
        {profile.headline ? <p className="text-vera-muted">{profile.headline}</p> : null}
        <p className="text-sm text-vera-muted">
          {[profile.locationCity, profile.locationRegion].filter(Boolean).join(", ")}
          {profile.openToWork ? " · Open to work" : ""}
        </p>
      </header>

      {profile.bio ? (
        <section>
          <h2 className="text-sm font-semibold">About</h2>
          <p className="mt-vera-2 text-sm whitespace-pre-wrap">{profile.bio}</p>
        </section>
      ) : null}

      {profile.skills.length > 0 ? (
        <section>
          <h2 className="text-sm font-semibold">Skills</h2>
          <ul className="mt-vera-2 flex flex-wrap gap-vera-2 text-sm">
            {profile.skills.map((s) => (
              <li key={s.skill} className="rounded border border-vera-border px-2 py-1">
                {s.skill}
                {s.level ? ` (${s.level})` : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {profile.tickets && profile.tickets.length > 0 ? (
        <section>
          <h2 className="text-sm font-semibold">Tickets & certifications</h2>
          <ul className="mt-vera-2 list-disc pl-5 text-sm">
            {profile.tickets.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {profile.workHistory.length > 0 ? (
        <section>
          <h2 className="text-sm font-semibold">Work history</h2>
          <ul className="mt-vera-4 space-y-vera-4">
            {profile.workHistory.map((h) => (
              <li key={h.id} className="text-sm border-l-2 border-vera-teal pl-vera-3">
                <p className="font-medium">
                  {h.role} · {h.employer}
                </p>
                {h.trade ? <p className="text-vera-muted">{h.trade}</p> : null}
                {h.description ? <p className="mt-vera-1">{h.description}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {profile.endorsements.length > 0 ? (
        <section>
          <h2 className="text-sm font-semibold">Endorsements</h2>
          <ul className="mt-vera-4 space-y-vera-3">
            {profile.endorsements.map((e) => (
              <li key={e.id} className="text-sm rounded border border-vera-border p-vera-3">
                <p className="font-medium">{e.skill}</p>
                <p className="text-vera-muted text-xs">
                  {e.endorserName} · {new Date(e.createdAt).toLocaleDateString()}
                </p>
                {e.message ? <p className="mt-vera-1">{e.message}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {profile.portfolio.length > 0 ? (
        <section>
          <h2 className="text-sm font-semibold">Portfolio</h2>
          <div className="mt-vera-4 grid grid-cols-2 gap-vera-3 sm:grid-cols-3">
            {profile.portfolio.map((p) => (
              <figure key={p.id} className="overflow-hidden rounded border border-vera-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.imageUrl} alt={p.caption ?? "Portfolio"} className="aspect-square object-cover w-full" />
                {p.caption ? (
                  <figcaption className="p-vera-2 text-xs text-vera-muted">{p.caption}</figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
