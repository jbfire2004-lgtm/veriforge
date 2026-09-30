"use client";

import { useEffect, useState } from "react";
import type { WalletWeatherAlert } from "@vera/api-contract";
import { fetchWorkerWeatherAlerts } from "@/lib/weather-alerts-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

const SEVERITY_STYLES: Record<string, string> = {
  extreme: "border-red-400 bg-red-50",
  severe: "border-orange-400 bg-orange-50",
  moderate: "border-amber-300 bg-amber-50",
  minor: "border-slate-200 bg-slate-50",
};

function severityClass(severity: string) {
  const key = severity.toLowerCase();
  if (key.includes("extreme") || key.includes("emergency")) return SEVERITY_STYLES.extreme;
  if (key.includes("severe") || key.includes("warning")) return SEVERITY_STYLES.severe;
  if (key.includes("moderate") || key.includes("watch")) return SEVERITY_STYLES.moderate;
  return SEVERITY_STYLES.minor;
}

export function WorkerWeatherAlerts({ workerId }: { workerId: string }) {
  const [alerts, setAlerts] = useState<WalletWeatherAlert[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchWorkerWeatherAlerts(workerId)
      .then(setAlerts)
      .catch(() => setAlerts([]))
      .finally(() => setLoaded(true));
  }, [workerId]);

  if (!loaded) return null;
  if (alerts.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          ⚠️ Weather alerts for this worker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-vera-3">
        {alerts.map((alert, i) => (
          <div
            key={`${alert.headline}-${i}`}
            className={`rounded-lg border p-vera-3 text-sm ${severityClass(alert.severity)}`}
          >
            <p className="font-semibold text-vera-charcoal">{alert.headline}</p>
            <p className="mt-1 text-xs uppercase text-vera-muted">{alert.severity}</p>
            <p className="mt-vera-2 text-vera-muted">{alert.description}</p>
            {alert.expires_at ? (
              <p className="mt-vera-2 text-xs text-vera-muted">
                Expires {new Date(alert.expires_at).toLocaleString()}
              </p>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
