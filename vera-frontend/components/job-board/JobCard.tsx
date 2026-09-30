import type { JobBoardJobSummary } from "@vera/api-contract";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui";

type Props = { job: JobBoardJobSummary };

export function JobCard({ job }: Props) {
  return (
    <Card className="h-full hover:border-vera-teal/40 transition-colors">
      <CardHeader>
        <CardTitle className="text-base">
          <Link href={`/jobs/${job.slug}`} className="hover:text-vera-teal">
            {job.title}
          </Link>
        </CardTitle>
        <CardDescription>
          {job.companyName}
          {job.location ? ` · ${job.location}` : ""}
        </CardDescription>
      </CardHeader>
      {job.summary ? (
        <CardContent>
          <p className="line-clamp-2 text-sm text-vera-muted">{job.summary}</p>
        </CardContent>
      ) : null}
      <CardFooter className="flex flex-wrap gap-vera-2 text-xs text-vera-muted">
        {job.trade ? <span>{job.trade}</span> : null}
        {job.payRange ? <span>{job.payRange}</span> : null}
        {job.experienceLevel ? (
          <span className="capitalize">{job.experienceLevel.toLowerCase()}</span>
        ) : null}
        {job.ticketNames && job.ticketNames.length > 0 ? (
          <span>{job.ticketNames.length} tickets required</span>
        ) : null}
      </CardFooter>
    </Card>
  );
}
