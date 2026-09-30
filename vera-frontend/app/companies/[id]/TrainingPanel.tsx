import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  GraduationCap,
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
import { cn } from "@/src/lib/utils";
import {
  formatShortDate,
  getExpiryTone,
  parseDate,
} from "@/components/wallet/worker-wallet-utils";
import type { CompanyTrainingRecord, CompanyWorker } from "./types";

type FlattenedTraining = CompanyTrainingRecord & {
  workerId: number;
  workerFirstName?: string | null;
  workerLastName?: string | null;
};

type SummaryTone = "neutral" | "good" | "warn" | "bad";

function flatten(workers: CompanyWorker[]): FlattenedTraining[] {
  return workers.flatMap((w) =>
    (w.trainingRecords ?? []).map((tr) => ({
      ...tr,
      workerId: w.id,
      workerFirstName: w.firstName ?? null,
      workerLastName: w.lastName ?? null,
    }))
  );
}

function summarize(records: FlattenedTraining[]): {
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

const toneStyles: Record<
  SummaryTone,
  { iconWrap: string; ring: string; valueText: string }
> = {
  neutral: {
    iconWrap: "bg-vera-teal/10 text-vera-deep",
    ring: "ring-vera-teal/20",
    valueText: "text-vera-deep",
  },
  good: {
    iconWrap: "bg-emerald-50 text-emerald-700",
    ring: "ring-emerald-100",
    valueText: "text-vera-deep",
  },
  warn: {
    iconWrap: "bg-amber-50 text-amber-700",
    ring: "ring-amber-100",
    valueText: "text-amber-700",
  },
  bad: {
    iconWrap: "bg-red-50 text-red-600",
    ring: "ring-red-100",
    valueText: "text-red-600",
  },
};

export function SummaryCard({
  icon: Icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  tone?: SummaryTone;
}) {
  const palette = toneStyles[tone];
  return (
    <Card className="border-vera-charcoal/10 shadow-md">
      <CardContent className="flex items-center gap-vera-4 p-vera-5">
        <span
          className={cn(
            "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-md ring-1 ring-inset",
            palette.iconWrap,
            palette.ring
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 space-y-vera-1">
          <p className="text-xs font-medium uppercase tracking-wide text-vera-muted">
            {label}
          </p>
          <p
            className={cn(
              "text-2xl font-medium tabular-nums tracking-tight",
              palette.valueText
            )}
          >
            {value.toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
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

export default function TrainingPanel({
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
            <GraduationCap className="h-5 w-5 text-vera-teal" aria-hidden />
            Training summary
          </h2>
          <p className="text-sm font-normal leading-relaxed text-vera-muted">
            Aggregated training records across the company.
          </p>
        </div>
      </header>

      <div className="grid gap-vera-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={Sigma} label="Records" value={stats.total} />
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
              <GraduationCap className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 space-y-vera-1">
              <CardTitle className="text-lg tracking-tight">
                Training records
              </CardTitle>
              <CardDescription>
                Sorted by soonest expiry — click a row to open the training
                viewer.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="No training records yet"
              description="Once workers complete training, their records will roll up here."
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Worker</TableHead>
                    <TableHead>Course</TableHead>
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
                        <TableCell className="text-vera-charcoal">
                          {r.certification?.name ?? "—"}
                          {r.certification?.code != null && (
                            <span className="ml-vera-2 font-mono text-xs text-vera-muted">
                              {r.certification.code}
                            </span>
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
                            href={`/verify/training?id=${encodeURIComponent(
                              String(r.id)
                            )}`}
                            className={buttonStyles({
                              variant: "outline",
                              size: "sm",
                            })}
                          >
                            Open
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {records.length > focused.length && (
                <p className="mt-vera-4 text-xs text-vera-muted">
                  Showing the {focused.length} soonest-expiring records of{" "}
                  {records.length}. Open a worker&apos;s wallet to see all
                  training.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
