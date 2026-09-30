"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWeatherSnapshot } from "./weather-service";
import type { WeatherLocation } from "./types";
import { WEATHER_CACHE_MS } from "./types";

export function weatherQueryKey(location: WeatherLocation | null) {
  if (!location) return ["weather", "none"] as const;
  return [
    "weather",
    location.latitude.toFixed(3),
    location.longitude.toFixed(3),
  ] as const;
}

export function useWeatherHazard(location: WeatherLocation | null) {
  return useQuery({
    queryKey: weatherQueryKey(location),
    queryFn: () => fetchWeatherSnapshot(location!),
    enabled: location != null,
    staleTime: WEATHER_CACHE_MS,
    refetchInterval: WEATHER_CACHE_MS,
  });
}
