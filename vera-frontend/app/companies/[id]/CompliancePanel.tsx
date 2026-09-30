"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { apiGet } from "@/lib/api";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ErrorState,
  Skeleton,
} from "@/components/ui";

type ComplianceSummary = {
  companyId: number;
  companyName: string;
  status: "COMPLIANT" | "NON_COMPLIANT" | string;
  expiredTrainingCount: number;
  expiringTrainingCount?: number;
  expiredCredentialsCount: number;
  workerIncidentsCount: number;
  equipmentIncidentsCount: number;
};

export default function CompliancePanel({ companyId }: { companyId: number }) {
  const [data, setData] = useState<ComplianceSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const summary = await apiGet<ComplianceSummary>(
          `/companies/${companyId}/compliance`
        );
        if (!cancelled) {
          setData(summary);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load compliance.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  if (error != null) {
    return (
      <ErrorState
        title="Compliance summary unavailable"
        description={error}
      />
    );
  }

  if (data == null) {
    return (
      <Card className="border-vera-charcoal/10 shadow-sm">
        <CardContent className="space-y-vera-3 p-vera-6">
          <Skeleton className="h-6 w-48 rounded" />
          <Skeleton className="h-4 w-72 rounded" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  const compliant = data.status === "COMPLIANT";

  return (
    <Card className="border-vera-charcoal/10 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-vera-3">
          {compliant ? (
            <ShieldCheck className="h-6 w-6 text-emerald-600" aria-hidden />
          ) : (
            <ShieldAlert className="h-6 w-6 text-amber-600" aria-hidden />
          )}
          <div>
            <CardTitle className="text-xl tracking-tight">
              Compliance summary
            </CardTitle>
            <CardDescription>
              Roll-up of expired training, credentials, and open incidents.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-vera-4">
        <Badge
          variant={compliant ? "success" : "danger"}
          className="text-xs uppercase tracking-wide"
        >
          {data.status}
        </Badge>

        <dl className="grid gap-vera-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Tile label="Expired training" value={data.expiredTrainingCount} />
          <Tile
            label="Expiring training (30d)"
            value={data.expiringTrainingCount ?? 0}
          />
          <Tile label="Expired credentials" value={data.expiredCredentialsCount} />
          <Tile label="Worker incidents" value={data.workerIncidentsCount} />
          <Tile label="Equipment incidents" value={data.equipmentIncidentsCount} />
        </dl>
      </CardContent>
    </Card>
  );
}

function Tile({ label, value }: { label: string; value: number }) {
  const valueClass = value > 0 ? "text-amber-700" : "text-vera-deep";
  return (
    <div className="rounded-xl border border-vera-charcoal/10 bg-vera-surface/40 p-vera-4">
      <dt className="text-xs font-semibold uppercase tracking-wider text-vera-muted">
        {label}
      </dt>
      <dd className={`mt-vera-1 text-2xl font-bold tabular-nums ${valueClass}`}>
        {value}
      </dd>
    </div>
  );
}
