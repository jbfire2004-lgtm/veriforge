"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  fetchMyRequiredOrientations,
  type OrientationRequiredItem,
} from "@/lib/orientation/api";
import { OrientationWorkerCompleteView } from "@/components/orientation/OrientationWorkerCompleteView";
import { WorkspaceHero, WorkspaceSection } from "@/components/theme/workspace";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function OnboardingOrientationPage() {
  const router = useRouter();
  const [required, setRequired] = useState<OrientationRequiredItem[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  function reload() {
    void fetchMyRequiredOrientations().then((rows) => {
      setRequired(rows);
      if (!rows.length) {
        router.replace("/welcome");
      }
    });
  }

  useEffect(() => {
    reload();
  }, []);

  if (activeId) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <OrientationWorkerCompleteView
          packageId={activeId}
          onFinished={() => {
            setActiveId(null);
            reload();
          }}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <WorkspaceHero
        eyebrow="Vera Core"
        title="Required orientation"
        description="Complete all assigned orientations before project access, tasks, and crew assignments."
        badges={[{ label: "Step 1 — Onboarding", tone: "teal" }]}
      />

      <WorkspaceSection title="Your orientations">
        {!required ? (
          <Skeleton className="h-32 w-full rounded-2xl" />
        ) : required.length === 0 ? (
          <p className="text-sm text-[#64748b]">All orientations complete.</p>
        ) : (
          <div className="grid gap-4">
            {required.map((row) => (
              <Card key={row.id} className="border-[#2A2E33]/10">
                <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
                  <div>
                    <h3 className="font-semibold text-[#2A2E33]">{row.package.title}</h3>
                    <p className="text-sm text-[#64748b]">
                      Status: {row.status.replace(/_/g, " ").toLowerCase()} · v
                      {row.package.version}
                    </p>
                  </div>
                  <Button type="button" size="sm" onClick={() => setActiveId(row.packageId)}>
                    Start
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </WorkspaceSection>

      <Link href="/welcome" className="text-sm font-medium text-[#2F8F8C] hover:underline">
        ← Back to workspace
      </Link>
    </main>
  );
}
