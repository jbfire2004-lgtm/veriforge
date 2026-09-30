"use client";

import { CompanyComplianceBadge } from "./CompanyComplianceBadge";
import type { CompanyComplianceResponse } from "@/lib/companies/compliance";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

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

const ENGINE_STATUS_CLASS: Record<string, string> = {
  pass: "text-emerald-700 bg-emerald-50",
  warning: "text-amber-800 bg-amber-50",
  fail: "text-red-700 bg-red-50",
};

const FLAG_TYPE_CLASS: Record<string, string> = {
  critical: "border-red-300 bg-red-50",
  major: "border-amber-300 bg-amber-50",
  minor: "border-slate-200 bg-slate-50",
};

type Props = {
  data: CompanyComplianceResponse;
};

export function CompanyCompliancePanel({ data }: Props) {
  const flagsByType = {
    critical: data.flags.filter((f) => f.type === "critical"),
    major: data.flags.filter((f) => f.type === "major"),
    minor: data.flags.filter((f) => f.type === "minor"),
  };

  return (
    <Card className="border-vera-charcoal/10 shadow-sm">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl">Compliance engines</CardTitle>
            <CardDescription>
              Last evaluated {formatWhen(data.lastEvaluatedAt)}
            </CardDescription>
          </div>
          <CompanyComplianceBadge status={data.overallStatus} size="lg" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="overflow-x-auto rounded-xl border border-vera-charcoal/10">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-vera-surface/60 text-xs uppercase tracking-wide text-vera-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Engine</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Score</th>
                <th className="px-4 py-3 font-semibold">Weight</th>
              </tr>
            </thead>
            <tbody>
              {data.engines.map((engine) => (
                <tr key={engine.id} className="border-t border-vera-charcoal/10">
                  <td className="px-4 py-3">
                    <p className="font-medium text-vera-deep">{engine.name}</p>
                    {engine.details ? (
                      <p className="mt-0.5 text-xs text-vera-muted">{engine.details}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-vera-muted">{engine.category}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${ENGINE_STATUS_CLASS[engine.status] ?? ""}`}
                    >
                      {engine.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold tabular-nums">{engine.score}</td>
                  <td className="px-4 py-3 tabular-nums text-vera-muted">
                    {Math.round(engine.weight * 100)}%
                  </td>
                </tr>
              ))}
              {!data.engines.length ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-vera-muted">
                    No engine evaluations yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {data.flags.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-vera-muted">
              Flags
            </h3>
            {(["critical", "major", "minor"] as const).map((type) =>
              flagsByType[type].length > 0 ? (
                <ul key={type} className="space-y-2">
                  {flagsByType[type].map((flag) => (
                    <li
                      key={flag.id}
                      className={`rounded-xl border px-4 py-3 ${FLAG_TYPE_CLASS[type]}`}
                    >
                      <p className="text-sm font-semibold text-vera-deep">{flag.label}</p>
                      {flag.description ? (
                        <p className="mt-1 text-sm text-vera-muted">{flag.description}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null,
            )}
          </div>
        ) : (
          <p className="text-sm text-vera-muted">No active compliance flags.</p>
        )}
      </CardContent>
    </Card>
  );
}
