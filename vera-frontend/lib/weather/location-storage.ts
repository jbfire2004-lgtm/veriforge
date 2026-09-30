import type { WeatherLocation } from "./types";
import { WEATHER_LOCATION_STORAGE_KEY } from "./types";

export function readStoredWeatherLocation(): WeatherLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(WEATHER_LOCATION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WeatherLocation;
    if (
      typeof parsed.latitude === "number" &&
      typeof parsed.longitude === "number" &&
      typeof parsed.label === "string"
    ) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function writeStoredWeatherLocation(location: WeatherLocation): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(WEATHER_LOCATION_STORAGE_KEY, JSON.stringify(location));
}
