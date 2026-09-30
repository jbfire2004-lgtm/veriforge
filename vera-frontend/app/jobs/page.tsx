import { Suspense } from "react";
import { fetchJobs } from "@/lib/job-board/api";
import { JobCard } from "@/components/job-board/JobCard";
import { JobFilters } from "@/components/job-board/JobFilters";

type Props = {
  searchParams: Promise<{
    trade?: string;
    location?: string;
    payMin?: string;
    payMax?: string;
    experienceLevel?: string;
    ticket?: string;
    q?: string;
  }>;
};

export default async function JobsIndexPage({ searchParams }: Props) {
  const params = await searchParams;
  const list = await fetchJobs({
    pageSize: 24,
    trade: params.trade,
    location: params.location,
    payMin: params.payMin ? parseFloat(params.payMin) : undefined,
    payMax: params.payMax ? parseFloat(params.payMax) : undefined,
    experienceLevel: params.experienceLevel,
    ticket: params.ticket,
    q: params.q,
  }).catch(() => ({ items: [], total: 0, page: 1, pageSize: 24 }));

  return (
    <div className="space-y-vera-8">
      <header>
        <h1 className="text-3xl font-semibold text-vera-deep">Job Board</h1>
        <p className="mt-vera-2 text-vera-muted max-w-xl">
          Trades workforce marketplace — find roles, match tickets, and apply with messaging built in.
        </p>
      </header>

      <Suspense fallback={null}>
        <JobFilters />
      </Suspense>

      <p className="text-sm text-vera-muted">{list.total} open roles</p>

      <div className="grid gap-vera-4 sm:grid-cols-2">
        {list.items.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
      {list.items.length === 0 ? (
        <p className="text-sm text-vera-muted">No jobs match your filters. Try broadening search.</p>
      ) : null}
    </div>
  );
}
