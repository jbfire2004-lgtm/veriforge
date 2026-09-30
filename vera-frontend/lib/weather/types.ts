export type HazardLevel = "safe" | "caution" | "danger";

export type WeatherLocation = {
  latitude: number;
  longitude: number;
  label: string;
};

export type WeatherHourlyPoint = {
  time: string;
  temperatureC: number;
  windSpeedKmh: number;
  windGustKmh: number;
  humidityPct: number;
  weatherCode: number;
};

export type WeatherHazardSnapshot = {
  location: WeatherLocation;
  fetchedAt: string;
  temperatureC: number;
  windSpeedKmh: number;
  windGustKmh: number;
  humidityPct: number;
  lightningRisk: HazardLevel;
  lightningLabel: string;
  heatColdIndex: number;
  heatColdLabel: string;
  heatColdType: "heat" | "cold" | "neutral";
  aqi: number | null;
  aqiLabel: string;
  aqiLevel: HazardLevel;
  fireBan: boolean;
  fireBanLabel: string;
  overallHazard: HazardLevel;
  conditions: string;
  hourly: WeatherHourlyPoint[];
  advisories: string[];
};

export const WEATHER_CACHE_MS = 15 * 60 * 1000;

export const WEATHER_LOCATION_STORAGE_KEY = "vera:weather-location";
