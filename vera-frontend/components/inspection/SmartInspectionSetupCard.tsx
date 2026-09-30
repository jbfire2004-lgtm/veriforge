"use client";

import { useEffect, useState } from "react";
import { listProjectInspectionSubcontractors } from "@/lib/pm-inspection-v2";
import { SfCard } from "@/src/components/safety-forms/ui";
import { CheckCircle2, AlertTriangle } from "lucide-react";

type Props = {
  projectId: number;
  companyId: number;
};

export function SmartInspectionSetupCard({ projectId, companyId }: Props) {
  const [companies, setCompanies] = useState<Array<{ id: number; name: string }>>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void listProjectInspectionSubcontractors(projectId)
      .then((rows) => setCompanies(rows))
      .catch(() => setCompanies([]))
      .finally(() => setLoaded(true));
  }, [projectId]);

  if (!loaded) return null;

  return (
    <SfCard className="space-y-3 p-5 text-sm">
      <h2 className="font-medium">Before you start</h2>
      <ul className="space-y-2 text-[var(--sf-text-muted)]">
        <li className="flex gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
          <span>
            Signed in with PM access (Worker or Supervisor role can capture photos and submit).
          </span>
        </li>
        <li className="flex gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
          <span>
            Backend API running — photos upload to{" "}
            <code className="text-xs">/api/v1/pm/inspections/:id/photos/capture</code>.
            AI analysis works when vision/LLM is configured; otherwise rule-based analysis still runs.
          </span>
        </li>
        <li className="flex gap-2">
          {companies.length > 0 ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
          ) : (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          )}
          <span>
            {companies.length > 0 ? (
              <>
                <strong>{companies.length}</strong> companies available for at-risk assignment
                ({companies.map((c) => c.name).slice(0, 3).join(", ")}
                {companies.length > 3 ? "…" : ""}).
              </>
            ) : (
              <>
                No project companies found yet. Add subcontractors in project config, assign workers
                from contractor companies, or use project #{projectId} / company #{companyId} with
                active project memberships so at-risk photos can be assigned.
              </>
            )}
          </span>
        </li>
        <li className="flex gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
          <span>
            For each photo: set location, description, Safe/At risk. At-risk items are dispatched
            to the selected company when you generate the report.
          </span>
        </li>
      </ul>
    </SfCard>
  );
}
