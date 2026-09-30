"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getCompanyCompliance,
  getCompanyScore,
  type CompanyComplianceResponse,
  type CompanyScoreResponse,
} from "@/lib/companies/compliance";
import { useCompanyComplianceAccess } from "@/hooks/useCompanyComplianceAccess";
import { CompanyCompliancePanel } from "@/components/companies/compliance/CompanyCompliancePanel";
import { CompanyScoreCard } from "@/components/companies/compliance/CompanyScoreCard";
import { CompanySubNav } from "@/components/companies/CompanySubNav";
import { CompanyComplianceBadge } from "@/components/companies/compliance/CompanyComplianceBadge";
import { Breadcrumbs, ErrorState, Skeleton } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";

type Props = {
  companyId: number;
  companyName: string;
};

export function CompanyCompliancePageClient({ companyId, companyName }: Props) {
  const { canViewCompliance, loading: authLoading } = useCompanyComplianceAccess();
  const [compliance, setCompliance] = useState<CompanyComplianceResponse | null>(null);
  const [score, setScore] = useState<CompanyScoreResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !canViewCompliance) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getCompanyCompliance(String(companyId)),
      getCompanyScore(String(companyId)),
    ])
      .then(([c, s]) => {
        if (!cancelled) {
          setCompliance(c);
          setScore(s);
          setError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load compliance data.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [companyId, canViewCompliance, authLoading]);

  const breadcrumbs = [
    { label: "VERA", href: "/" },
    { label: "Companies", href: "/companies" },
    { label: companyName, href: `/companies/${companyId}` },
    { label: "Compliance" },
  ];

  if (authLoading) {
    return <Skeleton className="h-64 w-full rounded-2xl" />;
  }

  if (!canViewCompliance) {
    return (
      <div className="space-y-vera-6">
        <Breadcrumbs items={breadcrumbs} />
        <ErrorState
          title="Not authorized"
          description="You do not have permission to view company compliance and scoring."
        >
          <Link
            href={`/companies/${companyId}`}
            className={buttonStyles({ variant: "outline", size: "md" })}
          >
            Back to company
          </Link>
        </ErrorState>
      </div>
    );
  }

  return (
    <div className="space-y-vera-6">
      <Breadcrumbs items={breadcrumbs} />
      <CompanySubNav companyId={companyId} />

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-vera-deep">{companyName}</h1>
          <p className="mt-1 text-sm text-vera-muted">
            Compliance engines and ISN-style scoring
          </p>
        </div>
        {compliance ? (
          <CompanyComplianceBadge status={compliance.overallStatus} size="lg" />
        ) : null}
      </header>

      {error ? (
        <ErrorState title="Compliance unavailable" description={error} />
      ) : loading ? (
        <div className="grid gap-vera-6 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      ) : compliance && score ? (
        <div className="grid gap-vera-6 lg:grid-cols-2">
          <CompanyScoreCard data={score} />
          <CompanyCompliancePanel data={compliance} />
        </div>
      ) : null}
    </div>
  );
}
