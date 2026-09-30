"use client";

import Link from "next/link";
import {
  ArrowRight,
  CloudSun,
  Loader2,
  MapPin,
  Thermometer,
  Wind,
} from "lucide-react";
import { useWeatherLocation } from "@/lib/weather/use-weather-location";
import { useWeatherHazard } from "@/lib/weather/use-weather-hazard";
import { HAZARD_BAR_STYLES, hazardTextClass } from "./weather/weather-hazard-styles";
import { cn } from "@/src/lib/utils";

/** Live weather & hazards — same footprint as Daily Briefing / Field Tools cards. */
export function WeatherFieldCard() {
  const { location, state } = useWeatherLocation();
  const { data, isLoading, isFetching } = useWeatherHazard(
    state.status === "loading" ? null : location,
  );

  const hazard = data?.overallHazard ?? "safe";
  const styles = HAZARD_BAR_STYLES[hazard];
  const accentBar =
    hazard === "danger"
      ? "from-red-500 to-orange-500"
      : hazard === "caution"
        ? "from-amber-500 to-orange-400"
        : "from-[#2F8F8C] to-[#3AA39F]";
  const iconGradient =
    hazard === "danger"
      ? "from-red-600 to-orange-500"
      : hazard === "caution"
        ? "from-amber-500 to-orange-500"
        : "from-[#2F8F8C] to-[#3AA39F]";
  const href = `/weather?lat=${location.latitude}&lon=${location.longitude}&label=${encodeURIComponent(location.label)}`;

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#2A2E33]/10 bg-gradient-to-br p-5 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg",
        "from-[#ecfdf5]/70 via-white to-white",
        styles.ring,
      )}
    >
      <div
        className={cn("absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r", accentBar)}
        aria-hidden
      />
      <div className="flex flex-1 flex-col gap-4">
        <span
          className={cn(
            "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md",
            iconGradient,
          )}
        >
          <CloudSun className="h-5 w-5" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#64748b]">
            Live conditions
            {(isFetching || isLoading) && (
              <Loader2 className="h-3 w-3 animate-spin text-[#2F8F8C]" aria-hidden />
            )}
          </p>
          <h3 className="mt-1 text-base font-bold text-[#2A2E33]">Weather & hazards</h3>
          {isLoading || !data ? (
            <div className="mt-2 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-[#2A2E33]/10" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-[#2A2E33]/10" />
            </div>
          ) : (
            <>
              <p className="mt-1 flex items-center gap-1 text-sm text-[#5a6b7c]">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#2F8F8C]" aria-hidden />
                <span className="truncate">{data.location.label}</span>
                {data.conditions ? (
                  <span className="truncate font-normal"> · {data.conditions}</span>
                ) : null}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <span className={cn("font-semibold tabular-nums", hazardTextClass(hazard))}>
                  {data.temperatureC.toFixed(0)}°C
                </span>
                <span className="flex items-center gap-1 text-[#64748b]">
                  <Wind className="h-3 w-3" aria-hidden />
                  {data.windSpeedKmh.toFixed(0)} km/h
                </span>
                <span className="flex items-center gap-1 text-[#64748b]">
                  <Thermometer className="h-3 w-3" aria-hidden />
                  {data.heatColdLabel}
                </span>
              </div>
            </>
          )}
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.08em] text-[#2F8F8C] transition group-hover:gap-2">
          Open
          <ArrowRight className="h-4 w-4" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
