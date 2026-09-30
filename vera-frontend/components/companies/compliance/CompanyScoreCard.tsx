"use client";

import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import type { CompanyScoreResponse } from "@/lib/companies/compliance";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { cn } from "@/src/lib/utils";

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function gradeColor(grade: string) {
  if (grade === "A" || grade === "B") return "text-emerald-600";
  if (grade === "C") return "text-amber-600";
  return "text-red-600";
}

function scoreRingColor(score: number) {
  if (score >= 80) return "stroke-emerald-500";
  if (score >= 60) return "stroke-amber-500";
  return "stroke-red-500";
}

type Props = {
  data: CompanyScoreResponse;
  compact?: boolean;
};

export function CompanyScoreCard({ data, compact = false }: Props) {
  const TrendIcon =
    data.trend === "improving" ? ArrowUp : data.trend === "declining" ? ArrowDown : Minus;
  const trendClass =
    data.trend === "improving"
      ? "text-emerald-600"
      : data.trend === "declining"
        ? "text-red-600"
        : "text-vera-muted";

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (data.isnStyleScore / 100) * circumference;

  return (
    <Card className={cn("border-vera-charcoal/10 shadow-sm", compact && "h-full")}>
      <CardHeader className={compact ? "pb-2" : undefined}>
        <CardTitle className={compact ? "text-base" : "text-xl"}>
          ISN-style company score
        </CardTitle>
        <CardDescription>Updated {formatWhen(data.lastUpdatedAt)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-center sm:gap-8">
          <div className="relative h-32 w-32 shrink-0">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                strokeWidth="10"
                className="stroke-vera-charcoal/10"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className={cn("transition-all duration-500", scoreRingColor(data.isnStyleScore))}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold tabular-nums text-vera-deep">
                {data.isnStyleScore}
              </span>
              <span className="text-xs text-vera-muted">/ 100</span>
            </div>
          </div>

          <div className="text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-vera-muted">Grade</p>
            <p className={cn("text-4xl font-bold", gradeColor(data.grade))}>{data.grade}</p>
            <p className={cn("mt-2 inline-flex items-center gap-1 text-sm font-medium", trendClass)}>
              <TrendIcon className="h-4 w-4" aria-hidden />
              {data.trend}
            </p>
          </div>
        </div>

        {!compact ? (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-vera-muted">
              Score breakdown
            </h3>
            <ul className="space-y-3">
              {data.breakdown.map((item) => (
                <li key={item.id} className="rounded-xl border border-vera-charcoal/10 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-vera-deep">{item.label}</p>
                      <p className="text-xs text-vera-muted">
                        {item.category} · weight {Math.round(item.weight * 100)}%
                      </p>
                      {item.rationale ? (
                        <p className="mt-1 text-xs text-vera-muted">{item.rationale}</p>
                      ) : null}
                    </div>
                    <span className="text-lg font-bold tabular-nums text-vera-deep">
                      {item.score}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-vera-charcoal/10">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        item.score >= 80
                          ? "bg-emerald-500"
                          : item.score >= 60
                            ? "bg-amber-500"
                            : "bg-red-500",
                      )}
                      style={{ width: `${Math.min(100, Math.max(0, item.score))}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
