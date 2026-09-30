"use client";

import * as React from "react";
import {
  MobileAngularCard,
  MobileScreenHeader,
  MobileStatusChip,
  VeriForgeButton,
  VeriForgeProgressBar,
  useTrainingAnalyticsSync,
  persistTrainingAnalytics,
  veriforgeTypography,
} from "@/components/veriforge";
import { cn } from "@/src/lib/utils";

type ModuleRow = {
  id: string;
  title: string;
  progress: number;
  status: "assigned" | "active" | "completed" | "overdue";
};

const SEED: ModuleRow[] = [
  { id: "m-101", title: "Lockout-Tagout", progress: 100, status: "completed" },
  { id: "m-102", title: "High-Heat Response", progress: 45, status: "active" },
  { id: "m-103", title: "Heavy Lift Safety", progress: 10, status: "assigned" },
  { id: "m-104", title: "Confined Space Entry", progress: 0, status: "overdue" },
];

export default function VeriForgeMobileTrainingPage() {
  const { analytics } = useTrainingAnalyticsSync();
  const [modules, setModules] = React.useState<ModuleRow[]>(SEED);
  const [activeId, setActiveId] = React.useState("m-102");
  const active = modules.find((item) => item.id === activeId) ?? modules[0];

  React.useEffect(() => {
    const average =
      modules.reduce((sum, item) => sum + item.progress, 0) / Math.max(modules.length, 1);
    const overdueModules = modules.filter((item) => item.status === "overdue").length;
    const completed = modules.filter((item) => item.status === "completed").length;
    const inProgress = modules.filter((item) => item.status === "active").length;
    persistTrainingAnalytics({
      completionRate: Math.round(average),
      averageScore: Math.round(average),
      overdueModules,
      inProgress,
      completed,
      totalModules: modules.length,
      totalAssignments: modules.length,
      timestamp: new Date().toISOString(),
    });
  }, [modules]);

  const bump = () => {
    setModules((prev) =>
      prev.map((item) => {
        if (item.id !== activeId) return item;
        const progress = Math.min(100, item.progress + 25);
        return {
          ...item,
          progress,
          status: progress >= 100 ? "completed" : "active",
        };
      }),
    );
  };

  return (
    <div className="space-y-4">
      <MobileScreenHeader
        kicker="Mobile Training"
        title="Module Deck"
        description="Steel-grey module cards with an angular content viewer for active lessons."
      />

      <VeriForgeProgressBar label="Field Training Completion" value={analytics.completionRate} />

      <div className="space-y-2">
        {modules.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveId(item.id)}
            className="w-full text-left"
          >
            <MobileAngularCard
              active={item.id === activeId}
              critical={item.status === "overdue"}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-[#aaaaaa]">{item.id}</p>
                </div>
                <MobileStatusChip
                  label={item.status}
                  tone={
                    item.status === "overdue"
                      ? "critical"
                      : item.status === "completed"
                        ? "pass"
                        : item.status === "active"
                          ? "pending"
                          : "neutral"
                  }
                />
              </div>
              <div className="mt-3">
                <VeriForgeProgressBar label="Progress" value={item.progress} />
              </div>
            </MobileAngularCard>
          </button>
        ))}
      </div>

      {active ? (
        <MobileAngularCard
          active
          className="bg-[linear-gradient(145deg,#222_0%,#171717_100%)]"
        >
          <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
            Content Viewer · {active.title}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#d2d2d2]">
            Review forged safety procedures, confirm acknowledgment checkpoints, and advance
            module progress. Active modules carry a red metallic glow until completion.
          </p>
          <div className="mt-4">
            <VeriForgeButton className="w-full" onClick={bump} disabled={active.progress >= 100}>
              {active.progress >= 100 ? "Module Complete" : "Advance +25%"}
            </VeriForgeButton>
          </div>
        </MobileAngularCard>
      ) : null}
    </div>
  );
}
