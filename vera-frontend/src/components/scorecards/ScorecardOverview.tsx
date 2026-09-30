"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { ScorecardView } from "@/lib/scorecard-api";
import { bucketLabel, weightClass } from "@/lib/scorecard-api";

const TYPE_LABELS: Record<string, string> = {
  insurance: "Insurance",
  wcb: "WCB",
  cor: "COR",
  scsa: "SCSA",
};

export function ScorecardOverview({ view }: { view: ScorecardView }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-normal uppercase tracking-wide text-zinc-500">
            Compliance score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">{view.complianceScore}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-normal uppercase tracking-wide text-zinc-500">
            Overall / global
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">{view.overallScore}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-normal uppercase tracking-wide text-zinc-500">
            Last calculated
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{new Date(view.calculatedAt).toLocaleString()}</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function ComplianceScoreSection({ view }: { view: ScorecardView }) {
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-600">
        Compliance score
      </h2>
      <p className="text-sm text-zinc-600">
        Base {view.complianceBreakdown.base} + delta{" "}
        {view.complianceBreakdown.complianceDelta} = {view.complianceScore}
      </p>
    </section>
  );
}

export function ScorecardBreakdown({ view }: { view: ScorecardView }) {
  const breakdown = view.complianceBreakdown?.required ?? {};
  return (
    <div className="overflow-x-auto border border-zinc-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="px-4 py-3">Artifact</th>
            <th className="px-4 py-3">State</th>
            <th className="px-4 py-3">Weight</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {Object.entries(breakdown).map(([type, row]) => (
            <tr key={type}>
              <td className="px-4 py-3 font-medium">{TYPE_LABELS[type] ?? type}</td>
              <td className="px-4 py-3 capitalize">{bucketLabel(row.bucket)}</td>
              <td className={`px-4 py-3 font-mono ${weightClass(row.weight)}`}>
                {row.weight > 0 ? `+${row.weight}` : row.weight}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProjectScoreSection({
  projects,
}: {
  projects: Array<Record<string, unknown>>;
}) {
  if (!projects.length) {
    return <p className="text-sm text-zinc-500">No project scores yet.</p>;
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {projects.map((p, i) => (
        <li key={String(p.projectId ?? i)} className="border border-zinc-200 bg-white p-4">
          <p className="font-medium">{String(p.projectName ?? p.projectId ?? "Project")}</p>
          <p className="mt-1 text-2xl font-semibold">{String(p.overall ?? "—")}</p>
          <p className="text-xs text-zinc-500">
            Safety {String(p.safety ?? "—")} · Compliance {String(p.compliance ?? "—")}
          </p>
        </li>
      ))}
    </ul>
  );
}
