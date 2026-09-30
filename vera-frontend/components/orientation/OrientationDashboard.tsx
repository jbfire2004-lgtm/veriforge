"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkles, Upload } from "lucide-react";
import {
  WorkspaceHero,
  WorkspaceMetricCard,
  WorkspaceSection,
} from "@/components/theme/workspace";
import {
  getCompanyOrientationCompliance,
  getProjectOrientationCompliance,
  listCompanyOrientations,
  listProjectOrientations,
  type OrientationCompliance,
  type OrientationPackageSummary,
} from "@/lib/orientation/api";
import { OrientationProgressBar } from "./OrientationProgressBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  companyId?: number;
  projectId?: number;
  basePath: string;
};

export function OrientationDashboard({ companyId, projectId, basePath }: Props) {
  const [items, setItems] = useState<OrientationPackageSummary[] | null>(null);
  const [compliance, setCompliance] = useState<OrientationCompliance | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const listLoad = companyId
      ? listCompanyOrientations(companyId)
      : projectId
        ? listProjectOrientations(projectId)
        : Promise.resolve([]);
    const complianceLoad = companyId
      ? getCompanyOrientationCompliance(companyId)
      : projectId
        ? getProjectOrientationCompliance(projectId)
        : Promise.resolve(null);
    void Promise.all([listLoad, complianceLoad])
      .then(([data, comp]) => {
        if (!cancelled) {
          setItems(data);
          setCompliance(comp);
          setError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load");
          setItems([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [companyId, projectId]);

  const published = items?.filter((i) => i.isPublished).length ?? 0;
  const totalWorkers = items?.reduce((s, i) => s + (i._count?.workerProgress ?? 0), 0) ?? 0;

  return (
    <div className="space-y-8">
      <WorkspaceHero
        eyebrow={projectId ? "Vera PM" : "Vera Companies"}
        title="Orientation"
        description="Upload or AI-generate orientations, assign workers, and track completion across languages."
        badges={[{ label: "Multi-language", tone: "teal" }]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href={`${basePath}/new?mode=upload`}>
              <Button variant="outline" size="sm" className="gap-2 bg-white/10 text-white border-white/30">
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            </Link>
            <Link href={`${basePath}/new?mode=ai`}>
              <Button size="sm" className="gap-2 bg-[#2F8F8C] hover:bg-[#247A78]">
                <Sparkles className="h-4 w-4" />
                AI generate
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <WorkspaceMetricCard label="Packages" value={String(items?.length ?? "—")} />
        <WorkspaceMetricCard label="Published" value={String(published)} />
        <WorkspaceMetricCard label="Worker links" value={String(totalWorkers)} />
      </div>

      {compliance && compliance.packageCount > 0 ? (
        <WorkspaceSection title="Training compliance" description="Orientation completion across linked workers">
          <OrientationProgressBar
            completed={compliance.completed}
            total={compliance.completed + compliance.pending + compliance.outdated}
            label="Overall orientation compliance"
          />
          <p className="mt-2 text-xs text-[#64748b]">
            {compliance.outdated} outdated · {compliance.pending} pending
          </p>
        </WorkspaceSection>
      ) : null}

      <WorkspaceSection title="Orientation packages" description="Company or project scoped content">
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : !items ? (
          <Skeleton className="h-32 w-full rounded-2xl" />
        ) : items.length === 0 ? (
          <Card className="border-dashed border-[#2A2E33]/20">
            <CardContent className="py-10 text-center text-sm text-[#64748b]">
              No orientation packages yet. Create one with upload or AI.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((pkg) => (
              <Link key={pkg.id} href={`${basePath}/${pkg.id}`}>
                <Card className="h-full border-[#2A2E33]/10 transition hover:-translate-y-0.5 hover:shadow-md">
                  <CardContent className="space-y-2 pt-6">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#64748b]">
                      {pkg.type.replace("_", " ")} · v{pkg.version}
                    </p>
                    <h3 className="text-lg font-semibold text-[#2A2E33]">{pkg.title}</h3>
                    <p className="text-sm text-[#5a6b7c]">
                      {pkg.languages.join(", ")} ·{" "}
                      {pkg.isPublished ? "Published" : "Draft"}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </WorkspaceSection>
    </div>
  );
}
