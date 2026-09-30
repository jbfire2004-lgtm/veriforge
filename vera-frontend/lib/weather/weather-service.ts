import {
  aqiLevel,
  fireBanHeuristic,
  heatColdStress,
  lightningRiskFromCode,
  maxHazardLevel,
  weatherCodeLabel,
} from "./hazard-calculations";
import type { WeatherHazardSnapshot, WeatherLocation } from "./types";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const AIR_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";
const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";

type GeoResult = {
  results?: Array<{
    name: string;
    country?: string;
    admin1?: string;
    latitude: number;
    longitude: number;
  }>;
};

type ForecastJson = {
  current?: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_gusts_10m: number;
    weather_code: number;
    cape?: number;
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    wind_speed_10m: number[];
    wind_gusts_10m: number[];
    weather_code: number[];
  };
};

type AirJson = {
  current?: {
    european_aqi?: number;
    us_aqi?: number;
    pm2_5?: number;
  };
  hourly?: {
    time: string[];
    european_aqi?: number[];
    us_aqi?: number[];
    pm2_5?: number[];
  };
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather API error (${res.status})`);
  return res.json() as Promise<T>;
}

export async function geocodePlace(query: string): Promise<WeatherLocation | null> {
  const q = query.trim();
  if (!q) return null;
  const params = new URLSearchParams({
    name: q,
    count: "1",
    language: "en",
    format: "json",
  });
  const data = await fetchJson<GeoResult>(`${GEO_URL}?${params}`);
  const hit = data.results?.[0];
  if (!hit) return null;
  const label = [hit.name, hit.admin1, hit.country].filter(Boolean).join(", ");
  return {
    latitude: hit.latitude,
    longitude: hit.longitude,
    label,
  };
}

export async function fetchWeatherSnapshot(
  location: WeatherLocation,
): Promise<WeatherHazardSnapshot> {
  const { latitude, longitude, label } = location;

  const forecastParams = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "wind_speed_10m",
      "wind_gusts_10m",
      "weather_code",
      "cape",
    ].join(","),
    hourly: [
      "temperature_2m",
      "relative_humidity_2m",
      "wind_speed_10m",
      "wind_gusts_10m",
      "weather_code",
    ].join(","),
    wind_speed_unit: "kmh",
    forecast_days: "2",
    timezone: "auto",
  });

  const airParams = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "european_aqi,us_aqi,pm2_5",
    hourly: "european_aqi,us_aqi,pm2_5",
    timezone: "auto",
  });

  const [forecast, air] = await Promise.all([
    fetchJson<ForecastJson>(`${FORECAST_URL}?${forecastParams}`),
    fetchJson<AirJson>(`${AIR_URL}?${airParams}`).catch(() => ({}) as AirJson),
  ]);

  const cur = forecast.current;
  if (!cur) throw new Error("No current weather data");

  const temp = cur.temperature_2m;
  const rh = cur.relative_humidity_2m;
  const wind = cur.wind_speed_10m;
  const gust = cur.wind_gusts_10m;
  const code = cur.weather_code;

  const lightning = lightningRiskFromCode(code, cur.cape ?? null);
  const heatCold = heatColdStress(temp, rh, gust);
  const aqiVal =
    air.current?.us_aqi ??
    air.current?.european_aqi ??
    null;
  const aqi = aqiLevel(aqiVal);
  const fire = fireBanHeuristic(temp, rh, gust);

  const hourlyTimes = forecast.hourly?.time ?? [];
  const hourly = hourlyTimes.slice(0, 48).map((time, i) => ({
    time,
    temperatureC: forecast.hourly!.temperature_2m[i] ?? temp,
    windSpeedKmh: forecast.hourly!.wind_speed_10m[i] ?? wind,
    windGustKmh: forecast.hourly!.wind_gusts_10m[i] ?? gust,
    humidityPct: forecast.hourly!.relative_humidity_2m[i] ?? rh,
    weatherCode: forecast.hourly!.weather_code[i] ?? code,
  }));

  const advisories: string[] = [];
  if (lightning.level !== "safe") {
    advisories.push("Lightning risk detected — suspend outdoor work at height and review ERP.");
  }
  if (heatCold.level === "danger") {
    advisories.push(
      heatCold.type === "heat"
        ? "Extreme heat stress — enforce hydration, shade, and work/rest cycles."
        : "Extreme cold stress — review layered PPE and exposure limits.",
    );
  }
  if (aqi.level !== "safe") {
    advisories.push("Air quality may require respiratory protection for sensitive work.");
  }
  if (fire.active) {
    advisories.push("Fire weather conditions — confirm municipal fire bans before hot work.");
  }
  if (gust >= 50) {
    advisories.push(`Wind gusts to ${Math.round(gust)} km/h — secure materials and review lift plans.`);
  }

  const overallHazard = maxHazardLevel(
    lightning.level,
    heatCold.level,
    aqi.level,
    fire.level,
    gust >= 60 ? "danger" : gust >= 40 ? "caution" : "safe",
  );

  return {
    location: { latitude, longitude, label },
    fetchedAt: new Date().toISOString(),
    temperatureC: temp,
    windSpeedKmh: wind,
    windGustKmh: gust,
    humidityPct: rh,
    lightningRisk: lightning.level,
    lightningLabel: lightning.label,
    heatColdIndex: heatCold.index,
    heatColdLabel: heatCold.label,
    heatColdType: heatCold.type,
    aqi: aqiVal,
    aqiLabel: aqi.label,
    aqiLevel: aqi.level,
    fireBan: fire.active,
    fireBanLabel: fire.label,
    overallHazard,
    conditions: weatherCodeLabel(code),
    hourly,
    advisories,
  };
}

/** Default fallback when geolocation unavailable (Edmonton area — common oil & gas hub). */
export const DEFAULT_WEATHER_LOCATION: WeatherLocation = {
  latitude: 53.5461,
  longitude: -113.4938,
  label: "Edmonton, Alberta",
};
