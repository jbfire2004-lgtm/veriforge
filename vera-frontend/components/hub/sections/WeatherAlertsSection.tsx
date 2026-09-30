"use client";

import { useState } from "react";
import type { WeatherSnapshotDto } from "@vera/api-contract";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { cn } from "@/src/lib/utils";

type Props = { weather: WeatherSnapshotDto };

const SEVERITY_STYLES: Record<string, string> = {
  INFO: "border-slate-200 bg-slate-50 text-slate-900",
  WATCH: "border-amber-300 bg-amber-50 text-amber-950",
  WARNING: "border-orange-400 bg-orange-50 text-orange-950",
  EMERGENCY: "border-red-500 bg-red-50 text-red-950",
};

const SEVERITY_BADGE: Record<string, string> = {
  INFO: "bg-slate-200 text-slate-800",
  WATCH: "bg-amber-200 text-amber-900",
  WARNING: "bg-orange-300 text-orange-950",
  EMERGENCY: "bg-red-500 text-white",
};

function AlertCard({
  alert,
}: {
  alert: WeatherSnapshotDto["alerts"][number];
}) {
  const [open, setOpen] = useState(false);
  const style = SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.INFO;
  const badge = SEVERITY_BADGE[alert.severity] ?? SEVERITY_BADGE.INFO;

  return (
    <Card className={cn("transition-colors", style)}>
      <CardHeader className="py-vera-3">
        <button
          type="button"
          className="flex w-full items-start justify-between gap-vera-3 text-left"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <div className="space-y-1">
            <span
              className={cn(
                "inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                badge
              )}
            >
              {alert.severity}
            </span>
            <CardTitle className="text-sm font-semibold">{alert.title}</CardTitle>
          </div>
          <span className="shrink-0 text-xs text-current/70">{open ? "−" : "+"}</span>
        </button>
      </CardHeader>
      {open ? (
        <CardContent className="space-y-vera-2 pt-0 text-xs">
          <p>{alert.description}</p>
          {alert.hazardType ? (
            <p className="text-current/70">Type: {alert.hazardType}</p>
          ) : null}
          {alert.endsAt ? (
            <p className="text-current/70">
              Until {new Date(alert.endsAt).toLocaleString()}
            </p>
          ) : null}
        </CardContent>
      ) : null}
    </Card>
  );
}

export function WeatherAlertsSection({ weather }: Props) {
  const hasWarning = weather.alerts.some(
    (a) => a.severity === "WARNING" || a.severity === "EMERGENCY"
  );

  return (
    <div className="grid gap-vera-4 md:grid-cols-2">
      <Card className={cn(hasWarning && "border-orange-300 bg-orange-50/40")}>
        <CardHeader>
          <CardTitle className="text-base">
            Weather hazards · {weather.region}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-vera-2 text-sm text-vera-muted">
          <p className="font-medium text-vera-charcoal">{weather.conditions}</p>
          <p>{weather.summary}</p>
        </CardContent>
      </Card>
      <div className="space-y-vera-3">
        {weather.alerts.length === 0 ? (
          <p className="text-sm text-vera-muted">No active hazard alerts.</p>
        ) : (
          weather.alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))
        )}
      </div>
    </div>
  );
}
