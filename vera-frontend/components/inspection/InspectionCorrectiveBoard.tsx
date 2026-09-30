"use client";

import { useEffect, useState } from "react";
import {
  getCorrectiveActionBoard,
  getInspectionOverdueAlerts,
  getContractorPerformance,
  type CorrectiveBoard,
} from "@/lib/pm-inspection-v2";
import { WorkspaceHero, WorkspaceMetricCard, WorkspaceSection } from "@/components/theme/workspace";
import { Skeleton } from "@/components/ui/skeleton";

type Props = { projectId: number };

export function InspectionCorrectiveBoard({ projectId }: Props) {
  const [board, setBoard] = useState<CorrectiveBoard | null>(null);
  const [alerts, setAlerts] = useState<number>(0);
  const [contractors, setContractors] = useState<
    Array<{ name: string; score: number; completionRate: number }>
  >([]);

  useEffect(() => {
    void Promise.all([
      getCorrectiveActionBoard(projectId),
      getInspectionOverdueAlerts(projectId),
      getContractorPerformance(projectId),
    ]).then(([b, a, c]) => {
      setBoard(b);
      setAlerts(a.alertCount);
      setContractors(c.contractors ?? []);
    });
  }, [projectId]);

  if (!board) return <Skeleton className="h-48 w-full rounded-2xl" />;

  const t = board.totals;

  return (
    <div className="space-y-8">
      <WorkspaceHero
        eyebrow="Vera PM"
        title="Corrective action board"
        description="Real-time inspection-driven CAPA from photo capture and checklist failures."
        badges={alerts > 0 ? [{ label: `${alerts} overdue`, tone: "amber" }] : [{ label: "Live", tone: "teal" }]}
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <WorkspaceMetricCard label="Open" value={String(t.open)} />
        <WorkspaceMetricCard label="In progress" value={String(t.inProgress)} />
        <WorkspaceMetricCard label="Verification" value={String(t.verification)} />
        <WorkspaceMetricCard label="Overdue" value={String(t.overdue)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {(["open", "in_progress", "verification_pending", "overdue"] as const).map((col) => (
          <WorkspaceSection
            key={col}
            title={col.replace(/_/g, " ")}
            description={`${(board.columns[col] ?? []).length} items`}
          >
            <ul className="space-y-2 text-sm">
              {(board.columns[col] ?? []).slice(0, 8).map((item: { id?: string; title?: string }) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-[#2A2E33]/10 bg-white px-3 py-2 text-[#2A2E33]"
                >
                  {item.title ?? item.id}
                </li>
              ))}
            </ul>
          </WorkspaceSection>
        ))}
      </div>

      {contractors.length > 0 ? (
        <WorkspaceSection title="Contractor performance">
          <ul className="divide-y divide-[#2A2E33]/10 rounded-xl border border-[#2A2E33]/10 bg-white">
            {contractors.map((c) => (
              <li key={c.name} className="flex justify-between px-4 py-3 text-sm">
                <span className="font-medium">{c.name}</span>
                <span className="text-[#64748b]">
                  Score {c.score} · {c.completionRate}% complete
                </span>
              </li>
            ))}
          </ul>
        </WorkspaceSection>
      ) : null}
    </div>
  );
}
