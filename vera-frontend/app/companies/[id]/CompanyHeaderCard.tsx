import Link from "next/link";
import { Building2, ClipboardCheck, GraduationCap, HardHat, Users } from "lucide-react";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import type { CompanyDetails } from "./types";

function countTraining(company: CompanyDetails): number {
  return (company.workers ?? []).reduce(
    (sum, w) => sum + (w.trainingRecords?.length ?? 0),
    0
  );
}

function countCredentials(company: CompanyDetails): number {
  return (company.workers ?? []).reduce(
    (sum, w) => sum + (w.credentials?.length ?? 0),
    0
  );
}

function HeroStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-vera-2 sm:gap-vera-3">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-vera-teal/10 text-vera-deep ring-1 ring-inset ring-vera-teal/20 sm:h-10 sm:w-10">
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-vera-muted">
          {label}
        </p>
        <p className="text-lg font-medium tabular-nums tracking-tight text-vera-deep sm:text-xl">
          {value.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export default function CompanyHeaderCard({
  company,
}: {
  company: CompanyDetails;
}) {
  const workerCount = company.workers?.length ?? 0;
  const equipmentCount = company.equipment?.length ?? 0;
  const trainingCount = countTraining(company);
  const credentialCount = countCredentials(company);

  return (
    <Card className="border-vera-charcoal/10 shadow-vera">
      <CardHeader className="gap-vera-4 sm:gap-vera-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-vera-3 sm:gap-vera-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-vera-charcoal/10 bg-vera-surface shadow-md ring-2 ring-vera-teal/20 sm:h-20 sm:w-20">
            {company.logoUrl != null && company.logoUrl !== "" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={company.logoUrl}
                alt={`${company.name} logo`}
                className="h-full w-full object-contain p-vera-2"
              />
            ) : (
              <Building2 className="h-8 w-8 text-vera-muted sm:h-10 sm:w-10" aria-hidden />
            )}
          </div>
          <div className="min-w-0 space-y-vera-2">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-vera-teal">
              Company profile
            </p>
            <CardTitle className="text-2xl tracking-tight text-vera-deep sm:text-3xl">
              {company.name}
            </CardTitle>
            <CardDescription>
              Workers, equipment, training, credentials, and requirements for
              this organization.
            </CardDescription>
            <Badge variant="outline" className="mt-vera-1 font-mono text-xs">
              Company #{company.id}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-vera-2 sm:shrink-0">
          <Link
            href={`/verify/company?id=${encodeURIComponent(String(company.id))}`}
            className={buttonStyles({ variant: "outline", size: "sm" })}
          >
            Public verify
          </Link>
          <Link
            href={`/companies/${company.id}/orientation`}
            className={buttonStyles({ variant: "outline", size: "sm" })}
          >
            Orientation
          </Link>
          <Link
            href={`/admin/companies/${company.id}`}
            className={buttonStyles({ variant: "teal", size: "sm" })}
          >
            Admin profile
          </Link>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-vera-4 border-t border-vera-charcoal/10 pt-vera-5 sm:gap-vera-5 sm:pt-vera-6 sm:grid-cols-4">
        <HeroStat icon={Users} label="Workers" value={workerCount} />
        <HeroStat icon={HardHat} label="Equipment" value={equipmentCount} />
        <HeroStat icon={GraduationCap} label="Training" value={trainingCount} />
        <HeroStat
          icon={ClipboardCheck}
          label="Credentials"
          value={credentialCount}
        />
      </CardContent>
    </Card>
  );
}
