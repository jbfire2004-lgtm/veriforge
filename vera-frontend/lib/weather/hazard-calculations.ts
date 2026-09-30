import type { HazardLevel } from "./types";

/** WMO codes with thunderstorm / lightning potential. */
const LIGHTNING_CODES = new Set([95, 96, 99]);

export function weatherCodeLabel(code: number): string {
  const map: Record<number, string> = {
    0: "Clear",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    61: "Rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Snow",
    80: "Rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm & hail",
    99: "Severe thunderstorm",
  };
  return map[code] ?? "Variable";
}

export function lightningRiskFromCode(
  code: number,
  cape?: number | null,
): { level: HazardLevel; label: string } {
  if (LIGHTNING_CODES.has(code)) {
    return { level: "danger", label: "Active storms" };
  }
  if (cape != null && cape > 1000) {
    return { level: "caution", label: "Elevated CAPE" };
  }
  if (cape != null && cape > 500) {
    return { level: "caution", label: "Possible buildup" };
  }
  return { level: "safe", label: "Low" };
}

/** Approximate heat index (°C) — Rothfusz-style simplification. */
export function heatIndexC(tempC: number, rhPct: number): number {
  if (tempC < 27) return tempC;
  const t = tempC;
  const rh = Math.max(0, Math.min(100, rhPct));
  return (
    t +
    0.5555 * ((6.11 * Math.exp((5417.753 * (1 / 273.16 - 1 / (t + 273.15))) * rh) / 100) - 10) +
    0.0694 * (1 + 0.00015 * rh * rh) * (t - 14.5)
  );
}

/** Wind chill (°C), Environment Canada formula. */
export function windChillC(tempC: number, windKmh: number): number {
  if (tempC > 10 || windKmh < 4.8) return tempC;
  const v = Math.pow(windKmh, 0.16);
  return (
    13.12 +
    0.6215 * tempC -
    11.37 * v +
    0.3965 * tempC * v
  );
}

export function heatColdStress(
  tempC: number,
  rhPct: number,
  windKmh: number,
): {
  index: number;
  label: string;
  type: "heat" | "cold" | "neutral";
  level: HazardLevel;
} {
  if (tempC >= 27 && rhPct >= 40) {
    const hi = heatIndexC(tempC, rhPct);
    if (hi >= 39) return { index: hi, label: `Heat ${hi.toFixed(0)}°C`, type: "heat", level: "danger" };
    if (hi >= 32) return { index: hi, label: `Heat ${hi.toFixed(0)}°C`, type: "heat", level: "caution" };
    return { index: hi, label: `Heat ${hi.toFixed(0)}°C`, type: "heat", level: "safe" };
  }
  if (tempC <= 10) {
    const wc = windChillC(tempC, windKmh);
    if (wc <= -27) return { index: wc, label: `Wind chill ${wc.toFixed(0)}°C`, type: "cold", level: "danger" };
    if (wc <= -10) return { index: wc, label: `Wind chill ${wc.toFixed(0)}°C`, type: "cold", level: "caution" };
    if (wc < tempC - 2) return { index: wc, label: `Wind chill ${wc.toFixed(0)}°C`, type: "cold", level: "safe" };
  }
  return { index: tempC, label: "Comfortable", type: "neutral", level: "safe" };
}

export function aqiLevel(aqi: number | null): { level: HazardLevel; label: string } {
  if (aqi == null) return { level: "caution", label: "Unavailable" };
  if (aqi <= 50) return { level: "safe", label: `Good (${aqi})` };
  if (aqi <= 100) return { level: "safe", label: `Moderate (${aqi})` };
  if (aqi <= 150) return { level: "caution", label: `Unhealthy SG (${aqi})` };
  if (aqi <= 200) return { level: "caution", label: `Unhealthy (${aqi})` };
  if (aqi <= 300) return { level: "danger", label: `Very unhealthy (${aqi})` };
  return { level: "danger", label: `Hazardous (${aqi})` };
}

export function fireBanHeuristic(
  tempC: number,
  humidityPct: number,
  windKmh: number,
): { active: boolean; label: string; level: HazardLevel } {
  const dry = humidityPct < 35;
  const windy = windKmh >= 30;
  const hot = tempC >= 28;
  if (hot && dry && windy) {
    return { active: true, label: "High risk — check local bans", level: "danger" };
  }
  if ((hot && dry) || (dry && windy)) {
    return { active: true, label: "Elevated — verify locally", level: "caution" };
  }
  return { active: false, label: "No ban signal", level: "safe" };
}

export function maxHazardLevel(...levels: HazardLevel[]): HazardLevel {
  if (levels.includes("danger")) return "danger";
  if (levels.includes("caution")) return "caution";
  return "safe";
}

export function hasLightningCode(code: number): boolean {
  return LIGHTNING_CODES.has(code);
}
