import type { WeatherHazardSnapshot } from "@/lib/weather/types";

export function formatWeatherForBriefing(w: WeatherHazardSnapshot): string {
  return [
    `Location: ${w.location.label}`,
    `Conditions: ${w.conditions}`,
    `Temperature: ${w.temperatureC.toFixed(1)}°C · Humidity ${w.humidityPct}%`,
    `Wind: ${w.windSpeedKmh.toFixed(0)} km/h (gusts ${w.windGustKmh.toFixed(0)} km/h)`,
    `Lightning risk: ${w.lightningLabel}`,
    `Thermal stress: ${w.heatColdLabel}`,
    `Air quality: ${w.aqiLabel}`,
    `Fire weather: ${w.fireBanLabel}`,
    w.advisories.length
      ? `Advisories: ${w.advisories.join(" ")}`
      : "No active VERA weather advisories.",
  ].join("\n");
}
