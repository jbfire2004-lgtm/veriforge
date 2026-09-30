"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, ShieldAlert, User, Users } from "lucide-react";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  StatusPill,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type StatusPillTone,
} from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import {
  getExpiryTone,
  parseDate,
} from "@/components/wallet/worker-wallet-utils";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import type { FlaggedWorkerRow } from "@/lib/api/companies";
import type { CompanyWorker } from "./types";

type WorkerStatus = {
  tone: StatusPillTone;
  label: string;
  icon: typeof CheckCircle2;
};

function workerCompliance(w: CompanyWorker): {
  expired: number;
  soon: number;
  trainCount: number;
  credCount: number;
} {
  const records = [
    ...(w.trainingRecords ?? []).map((t) => t.expiresAt ?? null),
    ...(w.credentials ?? []).map((c) => c.expiresAt ?? null),
  ];
  let expired = 0;
  let soon = 0;
  for (const raw of records) {
    const tone = getExpiryTone(parseDate(raw));
    if (tone === "bad") expired += 1;
    else if (tone === "soon") soon += 1;
  }
  return {
    expired,
    soon,
    trainCount: w.trainingRecords?.length ?? 0,
    credCount: w.credentials?.length ?? 0,
  };
}

function workerStatus(
  c: ReturnType<typeof workerCompliance>,
  apiFlags: string[] = []
): WorkerStatus {
  if (apiFlags.includes("INVALID_TRAINING")) {
    return {
      tone: "danger",
      label: "Invalid training",
      icon: ShieldAlert,
    };
  }
  if (apiFlags.includes("NON_COMPLIANT") || c.expired > 0) {
    return {
      tone: "danger",
      label: apiFlags.includes("NON_COMPLIANT")
        ? "Non-compliant"
        : `${c.expired} expired`,
      icon: ShieldAlert,
    };
  }
  if (apiFlags.includes("EXPIRING_TRAINING") || c.soon > 0) {
    return {
      tone: "warning",
      label: `${c.soon || apiFlags.length} expiring`,
      icon: AlertTriangle,
    };
  }
  if (c.trainCount + c.credCount > 0)
    return { tone: "success", label: "All current", icon: CheckCircle2 };
  return { tone: "neutral", label: "No records", icon: CheckCircle2 };
}

export default function WorkersPanel({
  workers,
  companyId,
}: {
  workers: CompanyWorker[];
  companyId: number;
}) {
  const [flagged, setFlagged] = useState<FlaggedWorkerRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await apiGet<{ flaggedWorkers: FlaggedWorkerRow[] }>(
          `/companies/${companyId}/training-compliance`
        );
        if (!cancelled) setFlagged(data.flaggedWorkers ?? []);
      } catch {
        if (!cancelled) setFlagged([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  const flagMap = new Map(flagged.map((f) => [f.workerId, f.flags]));

  return (
    <Card className="border-vera-charcoal/10 shadow-md">
      <CardHeader className="flex flex-row items-start justify-between gap-vera-3 space-y-0">
        <div className="flex items-start gap-vera-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-vera-teal/10 text-vera-deep ring-1 ring-inset ring-vera-teal/20">
            <Users className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 space-y-vera-1">
            <CardTitle className="text-xl tracking-tight">Workers</CardTitle>
            <CardDescription>
              Roster for this company. Open a worker&apos;s wallet to inspect
              details.
            </CardDescription>
          </div>
        </div>
        <Badge variant="outline" className="font-mono text-xs">
          {workers.length} total
        </Badge>
      </CardHeader>
      <CardContent>
        {workers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No workers on the roster"
            description="Workers added to this company will appear here."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Worker</TableHead>
                <TableHead className="text-right">Training</TableHead>
                <TableHead className="text-right">Credentials</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workers.map((w) => {
                const compliance = workerCompliance(w);
                const apiFlags = flagMap.get(w.id) ?? [];
                const status = workerStatus(compliance, apiFlags);
                const fullName =
                  [w.firstName, w.lastName].filter(Boolean).join(" ") ||
                  `Worker #${w.id}`;
                return (
                  <TableRow key={w.id}>
                    <TableCell>
                      <div className="flex min-w-0 items-center gap-vera-3">
                        {w.photoUrl != null && w.photoUrl !== "" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={w.photoUrl}
                            alt={fullName}
                            className="h-10 w-10 shrink-0 rounded-full border border-vera-charcoal/10 object-cover shadow-md"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-vera-surface shadow-md ring-1 ring-vera-charcoal/10">
                            <User
                              className="h-5 w-5 text-vera-muted"
                              aria-hidden
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link
                            href={`/verify/${w.id}`}
                            className="font-medium text-vera-charcoal hover:text-vera-teal hover:underline"
                          >
                            {fullName}
                          </Link>
                          <p className="text-xs text-vera-muted">
                            Worker #{w.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-vera-charcoal">
                      {compliance.trainCount}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-vera-charcoal">
                      {compliance.credCount}
                    </TableCell>
                    <TableCell>
                      <StatusPill
                        tone={status.tone}
                        icon={status.icon}
                        subtle
                      >
                        {status.label}
                      </StatusPill>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/verify/${w.id}`}
                        className={buttonStyles({
                          variant: "outline",
                          size: "sm",
                        })}
                      >
                        Wallet
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
