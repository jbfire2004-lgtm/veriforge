"use client";

import { useMemo } from "react";
import { useWeatherLocation } from "@/lib/weather/use-weather-location";
import { useWeatherHazard } from "@/lib/weather/use-weather-hazard";
import { formatWeatherForBriefing } from "./format-weather-summary";

/** Shared weather context for briefing form (same source as WeatherHazardBar). */
export function useBriefingWeather() {
  const { state, location } = useWeatherLocation();
  const enabled = state.status !== "loading";
  const { data, isLoading, isError, refetch } = useWeatherHazard(enabled ? location : null);

  const summary = useMemo(() => {
    if (!data) return "";
    return formatWeatherForBriefing(data);
  }, [data]);

  return {
    location,
    summary,
    isLoading: state.status === "loading" || isLoading,
    isError,
    refetch,
    ready: Boolean(data),
  };
}
