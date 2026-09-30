import type { JobPostDto } from "@vera/api-contract";
import Link from "next/link";
import { ArrowRight, Briefcase } from "lucide-react";
import { HubSurfaceCard } from "../HubSurfaceCard";

type Props = { job: JobPostDto };

export function JobPostCard({ job }: Props) {
  return (
    <HubSurfaceCard accentBar="from-[#2F8F8C] to-[#3AA39F]" surface="from-[#E4F3F2]/80 via-white to-white">
      <div className="flex flex-1 flex-col gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2F8F8C] to-[#3AA39F] text-white shadow-md">
          <Briefcase className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#64748b]">
            {job.trade ?? "Open role"}
          </p>
          <h3 className="mt-1 text-base font-bold text-[#2A2E33]">{job.title}</h3>
          <p className="mt-1 text-sm text-[#5a6b7c]">
            {job.companyName}
            {job.location ? ` · ${job.location}` : ""}
          </p>
          {job.summary ? (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#5a6b7c]">
              {job.summary}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748b]">
          {job.payRange ? <span>{job.payRange}</span> : null}
          <Link
            href={job.url?.startsWith("/") ? job.url : "/jobs"}
            className="inline-flex items-center gap-1 font-bold uppercase tracking-[0.08em] text-[#2F8F8C] hover:underline"
          >
            View posting
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </HubSurfaceCard>
  );
}
