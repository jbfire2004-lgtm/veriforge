import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  ShieldOff,
  Sigma,
} from "lucide-react";
import {
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
  formatShortDate,
  getExpiryTone,
  parseDate,
} from "@/components/wallet/worker-wallet-utils";
import type { CompanyCredential, CompanyWorker } from "./types";
import { SummaryCard } from "./TrainingPanel";

type FlattenedCredential = CompanyCredential & {
  workerId: number;
  workerFirstName?: string | null;
  workerLastName?: string | null;
};

function flatten(workers: CompanyWorker[]): FlattenedCredential[] {
  return workers.flatMap((w) =>
    (w.credentials ?? []).map((c) => ({
      ...c,
      workerId: w.id,
      workerFirstName: w.firstName ?? null,
      workerLastName: w.lastName ?? null,
    }))
  );
}

function summarize(records: FlattenedCredential[]): {
  total: number;
  expired: number;
  soon: number;
  good: number;
} {
  let expired = 0;
  let soon = 0;
  let good = 0;
  for (const r of records) {
    const tone = getExpiryTone(parseDate(r.expiresAt ?? null));
    if (tone === "bad") expired += 1;
    else if (tone === "soon") soon += 1;
    else if (tone === "good") good += 1;
  }
  return { total: records.length, expired, soon, good };
}

function recordStatusMeta(tone: ReturnType<typeof getExpiryTone>): {
  tone: StatusPillTone;
  label: string;
  icon: LucideIcon;
} {
  if (tone === "bad")
    return { tone: "danger", label: "Expired", icon: ShieldOff };
  if (tone === "soon")
    return { tone: "warning", label: "Expiring soon", icon: AlertTriangle };
  if (tone === "good")
    return { tone: "success", label: "Valid", icon: CheckCircle2 };
  return { tone: "neutral", label: "No expiry", icon: CheckCircle2 };
}

export default function CredentialsPanel({
  workers,
}: {
  workers: CompanyWorker[];
}) {
  const records = flatten(workers);
  const stats = summarize(records);

  const focused = [...records]
    .sort((a, b) => {
      const aExp = parseDate(a.expiresAt ?? null);
      const bExp = parseDate(b.expiresAt ?? null);
      const aTime = aExp ? aExp.getTime() : Number.POSITIVE_INFINITY;
      const bTime = bExp ? bExp.getTime() : Number.POSITIVE_INFINITY;
      return aTime - bTime;
    })
    .slice(0, 12);

  return (
    <section className="space-y-vera-5">
      <header className="flex flex-col gap-vera-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-vera-1">
          <h2 className="flex items-center gap-vera-2 text-xl font-medium tracking-tight text-vera-deep">
            <ClipboardCheck className="h-5 w-5 text-vera-teal" aria-hidden />
            Credential summary
          </h2>
          <p className="text-sm font-normal leading-relaxed text-vera-muted">
            Passes and IDs issued to this company&apos;s workers.
          </p>
        </div>
      </header>

      <div className="grid gap-vera-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={Sigma} label="Credentials" value={stats.total} />
        <SummaryCard
          icon={CheckCircle2}
          label="Valid"
          value={stats.good}
          tone="good"
        />
        <SummaryCard
          icon={AlertTriangle}
          label="Expiring 30d"
          value={stats.soon}
          tone="warn"
        />
        <SummaryCard
          icon={ShieldOff}
          label="Expired"
          value={stats.expired}
          tone="bad"
        />
      </div>

      <Card className="border-vera-charcoal/10 shadow-md">
        <CardHeader className="flex flex-row items-start justify-between gap-vera-3 space-y-0">
          <div className="flex items-start gap-vera-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-vera-teal/10 text-vera-deep ring-1 ring-inset ring-vera-teal/20">
              <ClipboardCheck className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 space-y-vera-1">
              <CardTitle className="text-lg tracking-tight">
                Credential records
              </CardTitle>
              <CardDescription>
                Sorted by soonest expiry — click a row to verify.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <EmptyState
              icon={ClipboardCheck}
              title="No credentials on file"
              description="Worker passes and IDs will appear once they are issued."
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Worker</TableHead>
                    <TableHead>Credential</TableHead>
                    <TableHead className="text-right">Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px] text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {focused.map((r) => {
                    const meta = recordStatusMeta(
                      getExpiryTone(parseDate(r.expiresAt ?? null))
                    );
                    const workerName =
                      [r.workerFirstName, r.workerLastName]
                        .filter(Boolean)
                        .join(" ") || `Worker #${r.workerId}`;
                    const label =
                      r.name ?? r.certification?.name ?? "Credential";
                    return (
                      <TableRow key={r.id}>
                        <TableCell>
                          <Link
                            href={`/verify/${r.workerId}`}
                            className="font-medium text-vera-charcoal hover:text-vera-teal hover:underline"
                          >
                            {workerName}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-vera-charcoal">
                            {label}
                          </p>
                          {r.value != null && r.value !== "" && (
                            <p className="font-mono text-xs text-vera-muted">
                              Ref {r.value}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-vera-muted">
                          {formatShortDate(parseDate(r.expiresAt ?? null))}
                        </TableCell>
                        <TableCell>
                          <StatusPill tone={meta.tone} icon={meta.icon} subtle>
                            {meta.label}
                          </StatusPill>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/verify/credential?id=${encodeURIComponent(
                              String(r.id)
                            )}`}
                            className={buttonStyles({
                              variant: "outline",
                              size: "sm",
                            })}
                          >
                            Verify
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {records.length > focused.length && (
                <p className="mt-vera-4 text-xs text-vera-muted">
                  Showing the {focused.length} soonest-expiring credentials of{" "}
                  {records.length}.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
