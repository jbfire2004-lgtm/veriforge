"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCompanyScore, type CompanyScoreResponse } from "@/lib/companies/compliance";
import { CompanyScoreCard } from "./CompanyScoreCard";
import { buttonStyles } from "@/components/ui/button";
import { Skeleton } from "@/components/ui";

type Props = {
  companyId: number;
};

export function CompanyScoreSummary({ companyId }: Props) {
  const [data, setData] = useState<CompanyScoreResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getCompanyScore(String(companyId))
      .then((score) => {
        if (!cancelled) {
          setData(score);
          setError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Score unavailable");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  if (error) return null;

  if (!data) {
    return (
      <div className="rounded-2xl border border-vera-charcoal/10 bg-white p-4">
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <CompanyScoreCard data={data} compact />
      <Link
        href={`/companies/${companyId}/compliance`}
        className={buttonStyles({ variant: "outline", size: "sm" })}
      >
        View full compliance
      </Link>
    </div>
  );
}
