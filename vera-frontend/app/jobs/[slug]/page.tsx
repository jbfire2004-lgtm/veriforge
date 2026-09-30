import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchJob } from "@/lib/job-board/api";
import { jobMetadata, jobPostingJsonLd, siteUrl } from "@/lib/job-board/seo";
import { loadPageSeo, jsonLdScriptTag } from "@/lib/seo/page-seo";
import { ApplyButton } from "@/components/job-board/ApplyButton";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const job = await fetchJob(slug);
    return jobMetadata(job);
  } catch {
    return { title: "Job not found" };
  }
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  let job;
  try {
    job = await fetchJob(slug);
  } catch {
    notFound();
  }

  let jsonLd: Record<string, unknown>;
  try {
    const seo = await loadPageSeo({ type: "JOB", slug });
    jsonLd = seo.jsonLd as Record<string, unknown>;
  } catch {
    jsonLd = jobPostingJsonLd(job, siteUrl()) as Record<string, unknown>;
  }

  return (
    <article className="space-y-vera-8">
      {jsonLdScriptTag(jsonLd)}
      <header className="space-y-vera-3">
        <p className="text-sm text-vera-muted">
          <Link href="/jobs" className="text-vera-teal hover:underline">
            ← All jobs
          </Link>
        </p>
        <h1 className="text-2xl font-semibold text-vera-deep">{job.title}</h1>
        <p className="text-vera-muted">
          {job.companyName}
          {job.location ? ` · ${job.location}` : ""}
          {job.payRange ? ` · ${job.payRange}` : ""}
        </p>
        <ul className="flex flex-wrap gap-vera-2 text-xs text-vera-muted">
          {job.trade ? <li className="rounded bg-vera-surface px-2 py-1">{job.trade}</li> : null}
          {job.experienceLevel ? (
            <li className="rounded bg-vera-surface px-2 py-1 capitalize">
              {job.experienceLevel.toLowerCase()}
            </li>
          ) : null}
          {job.projectName ? (
            <li className="rounded bg-vera-surface px-2 py-1">Project: {job.projectName}</li>
          ) : null}
        </ul>
      </header>

      {job.ticketNames && job.ticketNames.length > 0 ? (
        <section>
          <h2 className="text-sm font-semibold text-vera-deep">Required tickets</h2>
          <ul className="mt-vera-2 flex flex-wrap gap-vera-2 text-sm">
            {job.ticketNames.map((t) => (
              <li key={t} className="rounded border border-vera-border px-2 py-1">
                {t}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="prose max-w-none text-sm whitespace-pre-wrap">
        {job.description ?? job.summary}
      </section>

      <ApplyButton jobId={job.id} jobTitle={job.title} />
    </article>
  );
}
