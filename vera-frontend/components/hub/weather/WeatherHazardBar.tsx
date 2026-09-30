"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ChevronRight,
  CloudLightning,
  Flame,
  Loader2,
  MapPin,
  Thermometer,
  Wind,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWeatherLocation } from "@/lib/weather/use-weather-location";
import { useWeatherHazard } from "@/lib/weather/use-weather-hazard";
import {
  HAZARD_BAR_STYLES,
  hazardTextClass,
} from "./weather-hazard-styles";
import { cn } from "@/src/lib/utils";

function MetricPill({
  label,
  value,
  level,
  icon,
}: {
  label: string;
  value: string;
  level: "safe" | "caution" | "danger";
  icon: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 border-r border-[#2A2E33]/8 pr-3 last:border-r-0 last:pr-0">
      <span className="text-[#94a3b8]" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-[9px] font-bold uppercase tracking-[0.14em] text-[#64748b]">
          {label}
        </p>
        <p className={cn("truncate text-sm font-semibold tabular-nums", hazardTextClass(level))}>
          {value}
        </p>
      </div>
    </div>
  );
}

export function WeatherHazardBar() {
  const {
    state,
    location,
    manualQuery,
    setManualQuery,
    resolveManual,
    resolving,
    needsManualEntry,
  } = useWeatherLocation();
  const { data, isLoading, isError, refetch, isFetching } = useWeatherHazard(
    state.status === "loading" ? null : location,
  );

  const hazard = data?.overallHazard ?? "safe";
  const styles = HAZARD_BAR_STYLES[hazard];

  const href = `/weather?lat=${location.latitude}&lon=${location.longitude}&label=${encodeURIComponent(location.label)}`;

  if (needsManualEntry && state.status !== "ready") {
    return (
      <div
        className={cn(
          "flex max-h-20 min-h-[60px] flex-col justify-center gap-2 rounded-xl border border-[#2A2E33]/10 bg-white/80 px-4 py-3 shadow-md backdrop-blur-sm sm:flex-row sm:items-center",
          styles.ring,
          "ring-1",
        )}
      >
        <div className="flex items-center gap-2 text-sm text-[#5a6b7c]">
          <MapPin className="h-4 w-4 shrink-0 text-[#2F8F8C]" aria-hidden />
          <span>Set your work location for hazard weather data.</span>
        </div>
        <form
          className="flex flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void resolveManual();
          }}
        >
          <Input
            value={manualQuery}
            onChange={(e) => setManualQuery(e.target.value)}
            placeholder="City or site (e.g. Calgary)"
            className="h-9 text-sm"
            aria-label="Location search"
          />
          <Button type="submit" size="sm" disabled={resolving || !manualQuery.trim()}>
            {resolving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex max-h-20 min-h-[60px] flex-col gap-2 overflow-hidden rounded-xl border border-[#2A2E33]/10 bg-gradient-to-r px-4 py-2.5 shadow-md backdrop-blur-md transition hover:shadow-lg sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-3",
        styles.bg,
        styles.ring,
        "ring-1",
      )}
      aria-label="Open full weather and hazard details"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cn("h-2.5 w-2.5 shrink-0 rounded-full", styles.dot)}
          aria-hidden
        />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#64748b]">
            <MapPin className="h-3 w-3" aria-hidden />
            Weather & hazards
            {(isFetching || isLoading) && (
              <Loader2 className="h-3 w-3 animate-spin text-[#2F8F8C]" aria-hidden />
            )}
          </p>
          <p className="truncate text-sm font-semibold text-[#2A2E33]">
            {data?.location.label ?? location.label}
            {data?.conditions ? (
              <span className="font-normal text-[#64748b]"> · {data.conditions}</span>
            ) : null}
          </p>
        </div>
      </div>

      {isError ? (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void refetch();
          }}
          className="text-xs font-medium text-red-700 underline"
        >
          Retry load
        </button>
      ) : isLoading || !data ? (
        <div className="flex flex-1 items-center gap-3 opacity-60">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-20 animate-pulse rounded bg-[#2A2E33]/10" />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1 overflow-x-auto sm:justify-end">
          <MetricPill
            label="Temp"
            value={`${data.temperatureC.toFixed(0)}°C`}
            level={
              data.heatColdType === "heat" && data.overallHazard !== "safe"
                ? data.overallHazard
                : "safe"
            }
            icon={<Thermometer className="h-4 w-4" />}
          />
          <MetricPill
            label="Wind / gust"
            value={`${data.windSpeedKmh.toFixed(0)} / ${data.windGustKmh.toFixed(0)}`}
            level={data.windGustKmh >= 50 ? "danger" : data.windGustKmh >= 35 ? "caution" : "safe"}
            icon={<Wind className="h-4 w-4" />}
          />
          <MetricPill
            label="Lightning"
            value={data.lightningLabel}
            level={data.lightningRisk}
            icon={<CloudLightning className="h-4 w-4" />}
          />
          <MetricPill
            label="Heat / cold"
            value={data.heatColdLabel}
            level={
              data.heatColdType !== "neutral"
                ? data.overallHazard === "safe"
                  ? "caution"
                  : data.overallHazard
                : "safe"
            }
            icon={<Thermometer className="h-4 w-4" />}
          />
          <MetricPill
            label="AQI"
            value={data.aqi != null ? String(Math.round(data.aqi)) : "—"}
            level={data.aqiLevel}
            icon={<AlertTriangle className="h-4 w-4" />}
          />
          <MetricPill
            label="Fire ban"
            value={data.fireBan ? "Check" : "Clear"}
            level={data.fireBan ? "caution" : "safe"}
            icon={<Flame className="h-4 w-4" />}
          />
        </div>
      )}

      <ChevronRight
        className="hidden h-5 w-5 shrink-0 text-[#94a3b8] transition group-hover:translate-x-0.5 group-hover:text-[#2F8F8C] sm:block"
        aria-hidden
      />
    </Link>
  );
}
