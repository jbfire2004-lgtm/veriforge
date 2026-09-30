"use client";

import * as React from "react";
import {
  MobileAngularCard,
  MobileScreenHeader,
  MobileStatusChip,
  VeriForgeButton,
  VeriForgeTextField,
  VeriForgeSelect,
  VeriForgeProgressBar,
  persistIncidentAnalytics,
  useIncidentAnalyticsSync,
  useVeriForgeNotifications,
  veriforgeTypography,
} from "@/components/veriforge";
import { cn } from "@/src/lib/utils";

type Severity = "critical" | "moderate" | "low";
type IncidentStatus = "open" | "investigating" | "closed";

type IncidentRow = {
  id: string;
  title: string;
  severity: Severity;
  status: IncidentStatus;
  location: string;
};

const SEED: IncidentRow[] = [
  {
    id: "inc-1",
    title: "Hot work spark near fuel line",
    severity: "critical",
    status: "open",
    location: "Bay 4",
  },
  {
    id: "inc-2",
    title: "Missing LOTO tag",
    severity: "moderate",
    status: "investigating",
    location: "Cell B",
  },
  {
    id: "inc-3",
    title: "Minor abrasion",
    severity: "low",
    status: "closed",
    location: "Yard",
  },
];

export default function VeriForgeMobileIncidentsPage() {
  const { analytics } = useIncidentAnalyticsSync();
  const { push } = useVeriForgeNotifications();
  const [incidents, setIncidents] = React.useState<IncidentRow[]>(SEED);
  const [title, setTitle] = React.useState("");
  const [severity, setSeverity] = React.useState<Severity>("moderate");
  const [location, setLocation] = React.useState("");

  React.useEffect(() => {
    const criticalCount = incidents.filter((item) => item.severity === "critical").length;
    const openIncidents = incidents.filter((item) => item.status !== "closed").length;
    const moderateCount = incidents.filter((item) => item.severity === "moderate").length;
    const lowCount = incidents.filter((item) => item.severity === "low").length;
    persistIncidentAnalytics({
      ...analytics,
      totalIncidents: incidents.length,
      openIncidents,
      criticalCount,
      moderateCount,
      lowCount,
      investigationProgress: Math.round(
        (incidents.filter((item) => item.status === "closed").length /
          Math.max(incidents.length, 1)) *
          100,
      ),
      severityDistribution: [
        { severity: "critical", count: criticalCount },
        { severity: "moderate", count: moderateCount },
        { severity: "low", count: lowCount },
      ],
      timestamp: new Date().toISOString(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidents]);

  const report = () => {
    if (!title.trim()) return;
    const row: IncidentRow = {
      id: `inc-${Date.now()}`,
      title: title.trim(),
      severity,
      status: "open",
      location: location.trim() || "Field",
    };
    setIncidents((prev) => [row, ...prev]);
    push({
      category: "system",
      tone: severity === "critical" ? "critical" : "warning",
      title: severity === "critical" ? "CRITICAL INCIDENT" : "INCIDENT LOGGED",
      message: `${row.title} · ${row.location}`,
      forgeStatus: severity === "critical" ? "failed" : "pending",
      userId: 1,
    });
    setTitle("");
    setLocation("");
  };

  return (
    <div className="space-y-4">
      <MobileScreenHeader
        kicker="Mobile Incidents"
        title="Field Reports"
        description="Severity indicators with red glow on critical cards."
      />

      <MobileAngularCard critical={(analytics.criticalCount ?? 0) > 0}>
        <VeriForgeProgressBar
          label="Investigation Progress"
          value={analytics.investigationProgress ?? 50}
        />
        <p className="mt-2 text-xs text-[#b8b8b8]">
          Open: {analytics.openIncidents ?? 0} · Critical: {analytics.criticalCount ?? 0}
        </p>
      </MobileAngularCard>

      <div className="space-y-2">
        {incidents.map((item) => (
          <MobileAngularCard key={item.id} critical={item.severity === "critical"}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-[#aaaaaa]">
                  {item.location} · {item.status}
                </p>
              </div>
              <MobileStatusChip
                label={item.severity}
                tone={
                  item.severity === "critical"
                    ? "critical"
                    : item.severity === "moderate"
                      ? "pending"
                      : "neutral"
                }
              />
            </div>
          </MobileAngularCard>
        ))}
      </div>

      <MobileAngularCard className="bg-[linear-gradient(145deg,#222_0%,#171717_100%)]">
        <p className={cn(veriforgeTypography.heading, "mb-3 text-[11px] text-[#FAFAFA]")}>
          Report Incident
        </p>
        <div className="space-y-3">
          <VeriForgeTextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <VeriForgeSelect
            label="Severity"
            value={severity}
            onChange={(e) => setSeverity(e.target.value as Severity)}
            options={[
              { label: "Critical", value: "critical" },
              { label: "Moderate", value: "moderate" },
              { label: "Low", value: "low" },
            ]}
          />
          <VeriForgeTextField
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Bay / Cell"
          />
          <VeriForgeButton className="w-full" onClick={report}>
            Submit Report
          </VeriForgeButton>
        </div>
      </MobileAngularCard>
    </div>
  );
}
