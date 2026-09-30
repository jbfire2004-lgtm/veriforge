import type { WeatherSnapshotDto } from "@vera/api-contract";
import { DEFAULT_PUBLIC_WEATHER } from "@/lib/public-safety/weather-default";

type Props = { weather?: WeatherSnapshotDto };

const SEVERITY_STYLES: Record<string, string> = {
  INFO: "border-slate-200 bg-slate-50",
  WATCH: "border-amber-300 bg-amber-50",
  WARNING: "border-orange-400 bg-orange-50",
  EMERGENCY: "border-red-500 bg-red-50",
};

export function PublicWeatherPanel({ weather = DEFAULT_PUBLIC_WEATHER }: Props) {
  return (
    <section className="rounded-xl border border-[#2A2E33]/10 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold uppercase tracking-[0.06em] text-[#2A2E33]">
        Weather & hazard alerts
      </h2>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5a6b7c]">
        Regional snapshot for crew planning — sign in for personalized regions in Vera Hub.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-[#2A2E33]/10 bg-[#f8fafc] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#2A2E33]">
            {weather.region} · {weather.conditions}
          </p>
          {weather.temperatureC != null ? (
            <p className="mt-1 text-2xl font-semibold text-[#2F8F8C]">
              {weather.temperatureC}°C
            </p>
          ) : null}
          <p className="mt-2 text-sm text-[#5a6b7c]">{weather.summary}</p>
        </div>
        <div className="space-y-3">
          {weather.alerts.length === 0 ? (
            <p className="text-sm text-[#5a6b7c]">No active hazard alerts.</p>
          ) : (
            weather.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-lg border p-4 ${SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.INFO}`}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#5a6b7c]">
                  {alert.severity}
                </p>
                <p className="mt-1 text-sm font-bold uppercase tracking-wide text-[#2A2E33]">
                  {alert.title}
                </p>
                <p className="mt-1 text-sm text-[#5a6b7c]">{alert.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
