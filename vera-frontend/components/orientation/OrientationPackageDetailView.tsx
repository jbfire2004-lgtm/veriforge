"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getOrientation,
  getOrientationStats,
  publishOrientation,
  type OrientationPackageDetail,
  type OrientationStats,
} from "@/lib/orientation/api";
import { OrientationViewer } from "./OrientationViewer";
import { OrientationWorkerList } from "./OrientationWorkerList";
import { OrientationProgressBar } from "./OrientationProgressBar";
import { OrientationAssignmentPanel } from "./OrientationAssignmentPanel";
import { OrientationVersionHistory } from "./OrientationVersionHistory";
import { WorkspaceHero, WorkspaceSection } from "@/components/theme/workspace";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  packageId: string;
  basePath: string;
  scope: "COMPANY" | "PROJECT";
};

export function OrientationPackageDetailView({ packageId, basePath, scope }: Props) {
  const [pkg, setPkg] = useState<OrientationPackageDetail | null>(null);
  const [stats, setStats] = useState<OrientationStats | null>(null);
  const [tab, setTab] = useState("content");

  function reload() {
    void getOrientation(packageId).then(setPkg);
    void getOrientationStats(packageId).then(setStats).catch(() => setStats(null));
  }

  useEffect(() => {
    reload();
  }, [packageId]);

  if (!pkg) return <Skeleton className="h-64 w-full rounded-2xl" />;

  const sections = (pkg.currentVersion?.sections ?? {}) as Record<
    string,
    { id: string; type: string; title: string; body: string }[]
  >;

  return (
    <div className="space-y-6">
      <WorkspaceHero
        title={pkg.title}
        description={`${pkg.type} · Version ${pkg.version} · ${pkg.isPublished ? "Published" : "Draft"}`}
        badges={[{ label: pkg.languages.join(" · "), tone: "teal" }]}
        actions={
          !pkg.isPublished ? (
            <Button size="sm" onClick={() => void publishOrientation(packageId).then(reload)}>
              Publish & link workers
            </Button>
          ) : null
        }
      />

      {stats ? (
        <OrientationProgressBar
          completed={stats.completed}
          total={stats.total}
          label="Worker completion"
        />
      ) : null}

      <Link href={basePath} className="text-sm font-medium text-[#2F8F8C] hover:underline">
        ← Back to orientation dashboard
      </Link>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="workers">Workers</TabsTrigger>
          <TabsTrigger value="assign">Assignment</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
        </TabsList>
        <TabsContent value="content" className="mt-4">
          <OrientationViewer languages={pkg.languages} sections={sections} />
        </TabsContent>
        <TabsContent value="workers" className="mt-4">
          <WorkspaceSection title="Worker progress">
            <OrientationWorkerList packageId={packageId} />
          </WorkspaceSection>
        </TabsContent>
        <TabsContent value="assign" className="mt-4">
          <OrientationAssignmentPanel
            packageId={packageId}
            scope={scope}
            isPublished={pkg.isPublished}
            onAssigned={reload}
          />
        </TabsContent>
        <TabsContent value="versions" className="mt-4">
          <WorkspaceSection title="Version history">
            <OrientationVersionHistory
              packageId={packageId}
              currentVersion={pkg.version}
              onRollback={reload}
            />
          </WorkspaceSection>
        </TabsContent>
      </Tabs>
    </div>
  );
}
