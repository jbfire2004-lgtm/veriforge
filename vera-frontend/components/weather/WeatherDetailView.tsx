"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CloudLightning,
  Download,
  Loader2,
  MapPin,
  RefreshCw,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { WorkspaceHero } from "@/components/theme/workspace";
import { useWeatherHazard } from "@/lib/weather/use-weather-hazard";
import { useWeatherLocation } from "@/lib/weather/use-weather-location";
import { geocodePlace } from "@/lib/weather/weather-service";
import { exportWeatherPdf } from "@/lib/weather/export-weather-pdf";
import {
  HAZARD_BAR_STYLES,
  hazardTextClass,
} from "@/components/hub/weather/weather-hazard-styles";
import { cn } from "@/src/lib/utils";
import type { WeatherLocation } from "@/lib/weather/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

function locationFromSearchParams(
  params: URLSearchParams | ReadonlyURLSearchParams | null,
  fallback: WeatherLocation,
): WeatherLocation {
  if (!params) return fallback;
  const lat = params.get("lat");
  const lon = params.get("lon");
  const label = params.get("label");
  if (lat && lon) {
    const latitude = Number(lat);
    const longitude = Number(lon);
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      return {
        latitude,
        longitude,
        label: label ? decodeURIComponent(label) : fallback.label,
      };
    }
  }
  return fallback;
}

export function WeatherDetailView() {
  const searchParams = useSearchParams();
  const locHook = useWeatherLocation();
  const initialLocation = useMemo(
    () => locationFromSearchParams(searchParams, locHook.location),
    [searchParams, locHook.location],
  );
  const [activeLocation, setActiveLocation] = useState(initialLocation);
  const [placeQuery, setPlaceQuery] = useState("");
  const [resolving, setResolving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { data, isLoading, isError, refetch, isFetching } =
    useWeatherHazard(activeLocation);

  const hazard = data?.overallHazard ?? "safe";
  const barStyles = HAZARD_BAR_STYLES[hazard];

  const gustChart = useMemo(() => {
    if (!data?.hourly.length) return null;
    const labels = data.hourly.slice(0, 24).map((h) =>
      new Date(h.time).toLocaleTimeString(undefined, { hour: "numeric" }),
    );
    return {
      labels,
      datasets: [
        {
          label: "Wind speed (km/h)",
          data: data.hourly.slice(0, 24).map((h) => h.windSpeedKmh),
          borderColor: "#2F8F8C",
          backgroundColor: "rgba(13, 148, 136, 0.1)",
          fill: true,
          tension: 0.3,
        },
        {
          label: "Gusts (km/h)",
          data: data.hourly.slice(0, 24).map((h) => h.windGustKmh),
          borderColor: "#d97706",
          backgroundColor: "rgba(217, 119, 6, 0.08)",
          fill: true,
          tension: 0.3,
        },
      ],
    };
  }, [data]);

  async function changePlace(e: React.FormEvent) {
    e.preventDefault();
    setResolving(true);
    try {
      const loc = await geocodePlace(placeQuery);
      if (loc) {
        setActiveLocation(loc);
        locHook.applyLocation(loc);
      }
    } finally {
      setResolving(false);
    }
  }

  async function handleExportPdf() {
    if (!data) return;
    setExporting(true);
    try {
      const blob = await exportWeatherPdf(data);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vera-weather-${activeLocation.label.replace(/\W+/g, "-")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <Link
        href="/hub"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#2F8F8C] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to Vera Hub
      </Link>

      <WorkspaceHero
        eyebrow="Safety weather intelligence"
        title="Weather & hazard details"
        description="Open-Meteo forecast and air-quality data with VERA hazard scoring for field and site work."
        badges={[
          {
            label: data ? `Overall: ${data.overallHazard}` : "Loading",
            tone: hazard === "danger" ? "amber" : "teal",
          },
        ]}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              {isFetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
            <Button
              variant="teal"
              size="sm"
              onClick={() => void handleExportPdf()}
              disabled={!data || exporting}
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export PDF
            </Button>
          </>
        }
      />

      <Card className={cn("ring-1", barStyles.ring)}>
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center">
          <form className="flex flex-1 gap-2" onSubmit={changePlace}>
            <Input
              value={placeQuery}
              onChange={(e) => setPlaceQuery(e.target.value)}
              placeholder="Change location…"
              className="h-10"
              aria-label="Search location"
            />
            <Button type="submit" disabled={resolving || !placeQuery.trim()}>
              {resolving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Go"}
            </Button>
          </form>
          <p className="flex items-center gap-2 text-sm text-[#5a6b7c]">
            <MapPin className="h-4 w-4 text-[#2F8F8C]" />
            {activeLocation.label}
          </p>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-[#64748b]">
          <Loader2 className="mr-2 h-6 w-6 animate-spin text-[#2F8F8C]" />
          Loading forecast…
        </div>
      ) : isError || !data ? (
        <Card>
          <CardContent className="py-10 text-center text-red-700">
            Could not load weather data.{" "}
            <button type="button" className="underline" onClick={() => void refetch()}>
              Try again
            </button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryTile label="Temperature" value={`${data.temperatureC.toFixed(1)}°C`} level="safe" />
            <SummaryTile
              label="Wind / gusts"
              value={`${data.windSpeedKmh.toFixed(0)} / ${data.windGustKmh.toFixed(0)} km/h`}
              level={data.windGustKmh >= 50 ? "danger" : data.windGustKmh >= 35 ? "caution" : "safe"}
            />
            <SummaryTile label="Lightning" value={data.lightningLabel} level={data.lightningRisk} />
            <SummaryTile label="Heat / cold stress" value={data.heatColdLabel} level={data.overallHazard} />
            <SummaryTile label="Air quality" value={data.aqiLabel} level={data.aqiLevel} />
            <SummaryTile label="Fire ban signal" value={data.fireBanLabel} level={data.fireBan ? "caution" : "safe"} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Hourly forecast (48h)</CardTitle>
              </CardHeader>
              <CardContent className="max-h-80 overflow-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase tracking-wide text-[#64748b]">
                      <th className="py-2 pr-2">Time</th>
                      <th className="py-2 pr-2">°C</th>
                      <th className="py-2 pr-2">Wind</th>
                      <th className="py-2">Gust</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.hourly.map((h) => (
                      <tr key={h.time} className="border-b border-[#2A2E33]/5">
                        <td className="py-2 pr-2 whitespace-nowrap text-[#5a6b7c]">
                          {new Date(h.time).toLocaleString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                          })}
                        </td>
                        <td className="py-2 pr-2 font-medium">{h.temperatureC.toFixed(0)}</td>
                        <td className="py-2 pr-2">{h.windSpeedKmh.toFixed(0)}</td>
                        <td className="py-2">{h.windGustKmh.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Wind gust chart (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                {gustChart ? (
                  <Line
                    data={gustChart}
                    options={{
                      responsive: true,
                      plugins: { legend: { position: "bottom" } },
                      scales: { y: { beginAtZero: true, title: { display: true, text: "km/h" } } },
                    }}
                  />
                ) : null}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudLightning className="h-5 w-5 text-amber-600" />
                Lightning proximity map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative flex aspect-[2/1] items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#2A2E33]/20 bg-gradient-to-br from-slate-100 via-slate-50 to-teal-50">
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 30% 40%, rgba(251,191,36,0.35) 0%, transparent 45%), radial-gradient(circle at 70% 55%, rgba(239,68,68,0.2) 0%, transparent 40%)",
                  }}
                  aria-hidden
                />
                <p className="relative z-10 max-w-md px-6 text-center text-sm text-[#5a6b7c]">
                  Placeholder map — integrate live lightning strike feed (e.g. GLM / ENTLN) in a
                  future release. Current risk:{" "}
                  <span className={cn("font-semibold", hazardTextClass(data.lightningRisk))}>
                    {data.lightningLabel}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Heat index / cold stress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-[#5a6b7c]">
                <p>
                  <span className="font-semibold text-[#2A2E33]">Index value:</span>{" "}
                  {data.heatColdIndex.toFixed(1)}°C ({data.heatColdType})
                </p>
                <p>{data.heatColdLabel}</p>
                <p className="text-xs">
                  Heat index uses temperature and humidity; wind chill applies below 10°C with
                  wind — aligned with field safety briefing practices.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Air quality breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-[#5a6b7c]">
                <p className={cn("text-lg font-semibold", hazardTextClass(data.aqiLevel))}>
                  {data.aqiLabel}
                </p>
                <p className="text-xs">
                  Source: Open-Meteo Air Quality API (US AQI / European AQI). Refreshes every 15
                  minutes.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Fire bans & safety advisories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p
                className={cn(
                  "rounded-lg border px-4 py-3 text-sm",
                  data.fireBan
                    ? "border-amber-300 bg-amber-50 text-amber-950"
                    : "border-emerald-200 bg-emerald-50 text-emerald-900",
                )}
              >
                <span className="font-semibold">Fire ban indicator:</span> {data.fireBanLabel}
              </p>
              {data.advisories.length === 0 ? (
                <p className="text-sm text-[#5a6b7c]">No active VERA-generated advisories.</p>
              ) : (
                <ul className="list-disc space-y-2 pl-5 text-sm text-[#374151]">
                  {data.advisories.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function SummaryTile({
  label,
  value,
  level,
}: {
  label: string;
  value: string;
  level: "safe" | "caution" | "danger";
}) {
  return (
    <Card className={cn("ring-1", HAZARD_BAR_STYLES[level].ring)}>
      <CardContent className="pt-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748b]">{label}</p>
        <p className={cn("mt-1 text-lg font-semibold", hazardTextClass(level))}>{value}</p>
      </CardContent>
    </Card>
  );
}
